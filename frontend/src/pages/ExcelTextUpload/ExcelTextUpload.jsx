import React, { useState, useMemo, useCallback } from "react";
import {
  useExceltextMutation,
  useImagecheckMutation,
  useGetSubjectCodeQuery,
    useGetTableCountQuery,
} from "../../redux-slice/ExcelApiSlice";
import ExcelTextSample from "./ExcelTextSample";
import * as XLSX from "xlsx";
import excelresources from "./excelresource.json";
import { Form, Button, Alert, Card } from "react-bootstrap";
import UploadPageLayout from "../../components/DashboardComponents/UploadPageLayout";
import ErrorLogExcel from "../../components/Bottom/ErrorLogExcel";
import { useDispatch,useSelector } from "react-redux";
import { errDataInfo, errRemove } from "../../redux-slice/errResponseSlice";
import { parseCSVFromString } from "../../utils/txtFile";
 
const ExcelTextUpload = () => {
  const OptionFiles = excelresources.fileTypes;
 // const DegreeName = excelresources.DegreeName;
  const [excelFile, setExcelFile] = useState(null);
  const [textFile, setTextFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadVariant, setUploadVariant] = useState("info");
  const [excelData, setExcelData] = useState(null);
  const [textData, setTextData] = useState(null);
  
  const [uploadFileType, setUploadFileType] = useState("0");
  const [degreeName, setDegreeName] = useState("0");
  const [semMonth, setSemMonth] = useState("0");
  const [semYear, setSemYear] = useState("0");
  const [isProcessing, setIsProcessing] = useState(false);
  const dispatch = useDispatch();
  const monthyearInfo = useSelector((state) => state.auth.monthyearInfo);
  const DegreeName1 = useSelector((state) => state.auth.degreeInfo) ?? [];
  const userInfo = useSelector((state) => state.auth.userInfo);

  

  const [exceltext, { isLoading, isSuccess, isError, error }] =
    useExceltextMutation();
  const [imagecheck, { isLoading: isImageCheckLoading }] =
    useImagecheckMutation();

  const activeRecords = useMemo(() => 
    Array.isArray(monthyearInfo) ? monthyearInfo.filter((m) => m.Month_Year_Status === 'Y') : [],
    [monthyearInfo]
  );
  const DegreeName = useMemo(() => 
    Array.isArray(DegreeName1) ? DegreeName1.filter((d) => d.Flg === 'Y').map((d) => ({ id: d.id, name: d.Degree_Name, D_Code: d.D_Code })) : [],
    [DegreeName1]
  );
  const ExamMonth = useMemo(() => 
    [...new Set(activeRecords.map((m) => m.Eva_Month))].map((m) => ({ id: m, name: m })),
    [activeRecords]
  );
  const ExamYear = useMemo(() => 
    [...new Set(activeRecords.map((m) => m.Eva_Year))].map((y) => ({ id: y, name: y })),
    [activeRecords]
  );

  const { data: subjectCodeData } = useGetSubjectCodeQuery(
    { Dep_Name: degreeName },
    { skip: !degreeName || degreeName === '0' }
  );

  const { data: tableCountData, isLoading: isTableCountLoading, isError: isTableCountError, refetch: refetchTableCount } = useGetTableCountQuery(

  
  );

  console.log("Table Count Data:", tableCountData);

  console.log("Subject Code Data:", subjectCodeData);

  const handleExcelChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setExcelFile(file);

      // Read and parse Excel file
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target.result;
          const workbook = XLSX.read(data, { type: "binary" });

          // Get first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          setExcelData(jsonData);
        } catch (error) {
          console.error("Error parsing Excel:", error);
          setUploadStatus("Error parsing Excel file");
        }
      };
      reader.readAsBinaryString(file);
    }
  }, []);

  const ImageChek = useCallback(async (e) => {
    e.preventDefault();
    try {
      const response = await imagecheck().unwrap();
      if (response.ErrorFlag) {
        dispatch(errRemove());
        dispatch(errDataInfo(response));
      } else {
        dispatch(errRemove());
      }
    } catch (err) {
      console.error("Image Check error:", err);
    }
  }, [imagecheck, dispatch]);

  const handleTextChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setTextFile(file);

      // Read text file
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        setTextData(content);
      };
      reader.readAsText(file);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();


    if (uploadFileType === "0") {
      setUploadStatus("Please select a valid File Type");
      return;
    }
    if (degreeName === "0") {
      setUploadStatus("Please select Degree Name");
      return;
    }
    if (semMonth === "0") {
      setUploadStatus("Please select Exam Month");
      return;
    }
    if (semYear === "0") {
      setUploadStatus("Please select Exam Year");
      return;
    }
    if (!excelFile && !textFile) {
      setUploadStatus("Please select at least one file to upload");
      return;
    }

    // Prepare data to send
    const dataToSend = {
      excelData: excelData,
      textData: textData,
      excelFileName: excelFile?.name,
      textFileName: textFile?.name,
      uploadFileType: uploadFileType,
      degreeName: degreeName,
      semMonth: semMonth,
      semYear: semYear,
    };

  if(uploadFileType !=="15"){
    try {
      const response = await exceltext(dataToSend).unwrap();
      console.log("Upload response:", response);

      if (response.ErrorFlag == true) {
        setUploadStatus("Upload completed with errors. " + (response.TotalRecordCnt || 0)  + " total records and " + (response.RecrodCnt || 0) + " records processed. Check error log below.");
        setUploadVariant("warning");
        dispatch(errRemove());
        dispatch(errDataInfo(response));
        refetchTableCount();
      } else {
        setUploadStatus("Files uploaded successfully with " + (response.TotalRecordCnt || 0)  + " total records and " + (response.RecrodCnt || 0) + " records processed.");
        setUploadVariant("success");
        dispatch(errRemove());
        refetchTableCount();
      }

      // Reset files after successful upload
      setExcelFile(null);
      setTextFile(null);
      setExcelData(null);
      setTextData(null);

      // Reset file inputs
      document.getElementById("excelInput").value = "";
      document.getElementById("textInput").value = "";
    } catch (err) {
      setUploadStatus(
        "Upload failed: " + (err?.data?.message || "Unknown error")
      );
      setUploadVariant("danger");
      console.error("Upload error:", err);
    }
  } else {

    const parsedData = parseCSVFromString(textData);
    setIsProcessing(true);
    setUploadStatus("");

    let ErrRespons=[];
    let TotalRecordCnt = parsedData.length;
    let RecrodCnt = 0;

    for (const [index, item] of parsedData.entries()) {

      if (!item || !item.trim()) continue; // skip blank lines

      let buffer1 = item.replace(/,/g, "");
      let Data_Text = buffer1.split("|");

      if (!Data_Text[3]) {
        ErrRespons.push({ error: `Invalid line format (missing field 4): ${item.substring(0, 60)} ${index}` });
        continue;
      }

      let subimplt = Data_Text[3].split("_");
        let batchname = subimplt[0] || "";
      let subcode = subimplt[2] || "";
      let subjectInfo = subjectCodeData?.find(sub => sub.Subcode === subcode);
      if (!subjectInfo) {
        console.warn(`Subject code ${batchname} not found in subject code data`);
        ErrRespons.push({
          barcode: batchname,
          subcode: subcode,
          line: index+1,
          error: 'Subject code Not Found'});
        continue; // Skip this record and move to the next one
      }
     RecrodCnt++;
      // Perform necessary operations with each row of data
    }

    setIsProcessing(false);
    setUploadStatus("Upload completed with errors. " + (TotalRecordCnt || 0)  + " total records and " + (RecrodCnt || 0) + " records processed. Check error log below.");
    setUploadVariant(ErrRespons.length > 0 ? "warning" : "success");
    dispatch(errRemove());
    dispatch(errDataInfo({ Error_responseData: ErrRespons, ErrorFlag: ErrRespons.length > 0, RecrodCnt, TotalRecordCnt }));
    imagecheck();


  
  };
};

  return (
    <UploadPageLayout
      mainTopic="Excel and Text Upload System"
      subTopic={
        isTableCountLoading ? (
          <div style={{ color: 'rgb(13, 224, 9)', fontWeight: '600' }}>Loading counts...</div>
        ) : isTableCountError ? (
          <div style={{ color: 'red', fontWeight: '600' }}>Error loading counts</div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', color: 'rgb(13, 224, 9)', fontWeight: '600', gap: '65px' }}>
            <span>➣ Import1 - {tableCountData?.import1 || 0}</span>
            <span>➣ Faculty Reg - {tableCountData?.faculties || 0}</span>
            <span>➣ Sections - {tableCountData?.valid_sections || 0}</span>
            <span>➣ Valid questions - {tableCountData?.valid_question || 0}</span>
            <span>➣ Subject Master - {tableCountData?.sub_master || 0}</span>
          </div>
        )
      }   
      cardTitle="Excel and Text Upload"
      rightComponent={<ExcelTextSample />}
      bottomComponent={<ErrorLogExcel />}
    >
      <Form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-12 mb-3">
            <Form.Group controlId="uploadFileType">
              <Form.Label>File Type:</Form.Label>
              <Form.Select
                value={uploadFileType}
                onChange={(e) => setUploadFileType(e.target.value)}
              >
                {OptionFiles.map((file) => (
                  <option key={file.id} value={file.id}>
                    {file.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
        </div>

        <div className="row">
          <div className="col-4 mb-3">
            <Form.Group controlId="degreeName">
              <Form.Label>
                Degree Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={degreeName}
                onChange={(e) => setDegreeName(e.target.value)}
                required
              >
                <option value="00">Select Degree</option>
                {Array.isArray(DegreeName) && DegreeName.map((file) => (
                  <option key={file.id} value={file.D_Code}>
                    {file.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
          <div className="col-4 mb-3">
            <Form.Group controlId="excelFileType">
              <Form.Label>
                Exam Month <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={semMonth}
                onChange={(e) => setSemMonth(e.target.value)}
                required
              >
                <option value="0">Select Month</option>
                {ExamMonth.map((file) => (
                  <option key={file.id} value={file.name}>
                    {file.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
          <div className="col-4 mb-3">
            <Form.Group controlId="textFileType">
              <Form.Label>
                Exam Year <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={semYear}
                onChange={(e) => setSemYear(e.target.value)}
                required
              >
                <option value="0">Select Year</option>
                {ExamYear.map((file) => (
                  <option key={file.id} value={file.D_Code}>
                    {file.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
        </div>

        <div className="row">
          <div className="col-12 mb-3">
            <Form.Group controlId="excelInput">
              <Form.Label>Excel File (.xlsx, .xls):</Form.Label>
              <Form.Control
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelChange}
              />
              {excelFile && (
                <Form.Text className="text-muted">
                  Selected: {excelFile.name}
                </Form.Text>
              )}
            </Form.Group>
          </div>
          <div className="col-12 mb-3">
            <Form.Group controlId="textInput">
              <Form.Label>Text File (.txt):</Form.Label>
              <Form.Control
                type="file"
                accept=".txt"
                onChange={handleTextChange}
              />
              {textFile && (
                <Form.Text className="text-muted">
                  Selected: {textFile.name}
                </Form.Text>
              )}
            </Form.Group>
          </div>
        </div>
        <div className="row ">
          <div className="col-6 text-center">
            <Button
              type="submit"
              variant="success"
              disabled={isLoading || isProcessing || (!excelFile && !textFile)}
              size="lg"
            >
              {isLoading || isProcessing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {isProcessing ? "Processing..." : "Uploading..."}
                </>
              ) : "Upload Files"}
            </Button>
          </div>
          <div className="col-6 text-center">
            <Button
              type="button"
              variant="info"
              size="lg"
              onClick={ImageChek}
              disabled={isImageCheckLoading}
            >
              Image Check
            </Button>
          </div>
        </div>
        {uploadStatus && (
          <div className="row mt-4">
            <div className="col-12">
              <Alert
                variant={uploadVariant}
              >
                {uploadStatus}
              </Alert>
            </div>
          </div>
        )}
      </Form>
    </UploadPageLayout>
  );
};

export default ExcelTextUpload;
