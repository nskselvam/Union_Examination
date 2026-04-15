const express = require("express");
const asyncHandler = require("express-async-handler");
const AppError = require("../utils/appError");
const bcrypt = require("bcrypt");
const db = require("../db/models");
const fs = require("fs");
const readline = require("readline");
const { get } = require("http");
const sub_master = db.sub_master;
const staff_master = db.staff_master;
const faculties = db.faculties;
const valid_question = db.valid_question;
const valid_sections = db.valid_sections;
const { formatToIST, formatDateOnly, getCurrentISTDateTime, numberToWords } = require("../utils/formatDateTime");
const e = require("express");

// Function to read CSV file line by line
const readCSVLineByLine = async (filePath) => {
  const results = [];
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let headers = [];
  let isFirstLine = true;

  for await (const line of rl) {
    if (isFirstLine) {
      // Parse headers from first line
      headers = line.split(",").map((header) => header.trim());
      isFirstLine = false;
    } else {
      // Parse data rows
      const values = line.split(",").map((value) => value.trim());
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      results.push(row);
      console.log("Processing row:", row);
    }
  }

  return results;
};

// Function to read CSV from text data string
const parseCSVFromString = (csvString) => {
  const lines = csvString.split("\n");
  const results = [];
  let headers = [];

  lines.forEach((line, index) => {
    if (!line.trim()) return; // Skip empty lines

    // Parse data rows
    //    const values = line.split(',').map(value => value.trim());
    //      const row = {};
    // headers.forEach((header, idx) => {
    //   row[header] = values[idx] || '';
    // });
    results.push(line);
    //      console.log('Processing row:', row);
  });

  return results;
};

const exgeneralMasterData = asyncHandler(async (req, res) => {
  const {
    excelData,
    textData,
    excelFileName,
    textFileName,
    uploadFileType,
    semMonth,
    semYear,
    degreeName
  } = req.body;

  let RecrodCnt = 0;
  let TotalRecordCnt = 0;

  console.log("Received Data:", req.body);

  let Error_responseData = [];
  let ErrorFlag = false;
  let data_existing;
  let keyChk;

  console.log("Upload File Type:", uploadFileType);

  if (uploadFileType == "1") {
    let ErrorFlag = false;

    console.log("Text Data Received:", req.body);

    //console.log("Text Data Received:", textData);
    results = parseCSVFromString(textData);
    TotalRecordCnt = results.length;
    for (let index = 0; index < results.length; index++) {
      let item = results[index];
      if (item.length < 5) continue; // Skip invalid lines
      let buffer1 = item.replace(/,/g, "");
      let Data_Text = buffer1.split("|");
      let subimplt = Data_Text[3].split("_");
      let batchname = subimplt[0] || "";
      let ImgCnt = Data_Text[8] || "";
      let subcode = subimplt[2] || "";
      let Dep_Name = degreeName || "";
      ImpDate = Data_Text[5] || "";
      let barcode = subimplt[0] || "";
      // Generate a random number between min and max (inclusive)
      function Rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      let R_No = Rand(1000000, 9000000);
      console.log("Processing row:", subimplt);

      const Import_Cnt = await db.sub_master.findOne({
        where: {
          Subcode: subcode,
          Dep_Name: degreeName

        },
        attributes: ["Valcnt"],
      });

      if (!Import_Cnt) {
        throw new AppError(`Subcode Not Found in  Subject Master -  ${subcode}`, 404);
      }

      for (let iii = 1; iii <= parseInt(Import_Cnt.Valcnt); iii++) {
        const tableName = `import${iii}`;
        const data_existing = await db[tableName].findOne({
          where: {
            batchname: batchname,
            Dep_Name: degreeName
          },
        });
        if (!data_existing) {
          await db[tableName].create({
            batchname: batchname,
            subcode: subcode,
            Dep_Name: Dep_Name,
            barcode: barcode,
            ImgCnt: ImgCnt,
            Implot: iii,
            R_No: R_No,
            Eva_Mon_Year: `${semMonth}_${semYear}`,
            Checked: "NO",
            Chief_Checked: "NO",
            E_flg: "I",
            Chief_E_flg: "N",
            ImpDate: getCurrentISTDateTime(),

          });
          RecrodCnt = RecrodCnt + 1;
        } else {
          ErrorFlag = true;
          console.log("Duplicate batchname found:", batchname);
          Error_responseData.push({
            Barcode: batchname,
            subcode: subcode,
            import_type: iii,
            Error_Message: "Barcode already exists in the database",
          });
        }
      }
    }



    res.status(200).json({
      Error_responseData,
      ErrorFlag,
      RecrodCnt,
      TotalRecordCnt
    });
  } else if (uploadFileType == "2") {
    let ErrorFlag = false;

    // Use a for loop directly instead of Promise.all for sequential processing
    TotalRecordCnt = excelData.length;
    for (let index = 0; index < excelData.length; index++) {
      let item = excelData[index];

      console.log(item);
      let keyChk;
      if (item.Role == "1") {
        keyChk = String(item.chief_examiner || "").replace(/[\r\n\t\s]/g, "");
      } else if (item.Role == "2") {
        keyChk = String(item.Eva_Id || "").replace(/[\r\n\t\s]/g, "");
      } else {
        keyChk = String(item.Eva_Id || "").replace(/[\r\n\t\s]/g, "");
      }
      data_existing = await faculties.findOne({
        where: {
          Eva_Id: keyChk,
        },
      });

      let Dep_Name_Field = `Dep_Name_${item.Role}`;
      let User_Roll_Admin= `User_Roll_Admin_${item.Role}`;
      let Role_Admin_Data = await db.roll_master.findOne({ where: { rollName: item.Role } });
      if (!data_existing) {
        RecrodCnt = RecrodCnt + 1;
        const staff_response = await staff_master.findOne({
          where: {
            Eva_Id: keyChk,
          },
        });

        let Candidate_Name = staff_response
          ? staff_response.FACULTY_NAME
          : null;
        let Candidate_email = staff_response ? staff_response.Email_Id : null;
        let Candidate_mobile = staff_response
          ? staff_response.Mobile_Number
          : null;

        const generatePasword = Math.random()
          .toString(36)
          .slice(-8)
          .toString()
          .toUpperCase();



        await faculties.create({
          Eva_Id: keyChk,
          // Dep_Name: String(item.Dep_Code || "").padStart(2, "0"),
          [Dep_Name_Field]: String(item.Dep_Code || "").padStart(2, "0"),
          Role: item.Role == "1" ? item.Role + ",7" : item.Role,
          FACULTY_NAME: item.Role == "1" ? item.Chief_Name || Candidate_Name : item.FACULTY_NAME || Candidate_Name,
          Password: await bcrypt.hash(generatePasword, bcrypt.genSaltSync(10)),
          Temp_Password: generatePasword,
          ResetPass: 0,
          subcode: item.Role == 2 ? String(item.subcode || "").replace(/[\r\n\t\s]/g, "") : null,
          Eva_Subject:
            item.Role == 2
              ? String(item.Eva_Subject || "").replace(/[\r\n\t\s]/g, "")
              : null,
          Chief_subcode: item.Role == 1 ? String(item.subcode || "").replace(/[\r\n\t\s]/g, "") : null,
          chief_examiner:
            item.Role == 1
              ? String(item.Eva_Id || "").replace(/[\r\n\t\s]/g, "")
              : null,
          Chief_Eva_Subject:
            item.Role == 1
              ? String(item.Eva_Subject || "").replace(/[\r\n\t\s]/g, "")
              : null,
          Max_Paper: item.Max_Paper,
          Dep_Name_7: item.Role == "1" ? String(item.Dep_Code || "").padStart(2, "0") : null,
          Sub_Max_Paper: item.Role == 2 ? (item.Sub_Max_Paper || 0) : null,
          Email_Id: Candidate_email || item.Email_Id,
          Mobile_Number: Candidate_mobile || item.Mobile_Number,
          servername: req.get("host"),
          Camp_id: item.Role == 2 ? item.Camp_id : null,
          camp_offcer_id_examiner: item.Role == 2 ? item.camp_offcer_id : null,
          Camp_id_chief: item.Role == 1 ? item.Camp_id : null,
          camp_offcer_id_chief: item.Role == 1 ? item.camp_offcer_id : null,
          Eva_Mon_Year: `${semMonth}_${semYear}`,
          Examiner_Valuation_Status: item.Role == 2 ? "N" : null,
          Chief_Valuation_Status: item.Role == 1 ? "N" : null,
          Camp_id_Camp: item.Role == 4 ? item.Camp_id : null,
          sms_status: "N",
          [User_Roll_Admin]: Role_Admin_Data ? (Role_Admin_Data.rollDescrption ? JSON.parse(Role_Admin_Data.rollDescrption).join(',') : null) : null,

        });
        RecrodCnt = RecrodCnt + 1;
      } else {
        let Dep_Code;
        let isDuplicate = false;
        let RollChek;
        let RollUpdate;
        let Camp_id_Camp;
        let Camp_id_Camp_Check;
        if (item.Role == "1") {
          //Dep_Code = data_existing.Dep_Name
          Dep_Code = data_existing[Dep_Name_Field]
            ? data_existing[Dep_Name_Field].split(",").map((code) => code.trim())
            : [];
          let chief_subcode = data_existing.Chief_subcode
            ? data_existing.Chief_subcode.split(",").map((code) => code.trim())
            : [];
          let Chief_Eva_Subject = data_existing.Chief_Eva_Subject
            ? data_existing.Chief_Eva_Subject.split(",").map((code) =>
              code.trim()
            )
            : [];
          let chief_examiner = data_existing.chief_examiner
            ? data_existing.chief_examiner.split(",").map((code) => code.trim())
            : [];
          let Camp_id_chief = data_existing.Camp_id_chief
            ? data_existing.Camp_id_chief.split(",").map((code) => code.trim())
            : [];
          let camp_offcer_id_chief = data_existing.camp_offcer_id_chief
            ? data_existing.camp_offcer_id_chief
              .split(",")
              .map((code) => code.trim())
            : [];
          let Chief_Valuation_Status = data_existing.Chief_Valuation_Status
            ? data_existing.Chief_Valuation_Status
              .split(",")
              .map((code) => code.trim())
            : [];
          console.log(
            "Existing chief_examiner data found:",
            chief_examiner.length
          );
          RollChek = data_existing.Role
            ? data_existing.Role.split(",").map((code) => code.trim())
            : [];
          RollUpdate = RollChek.find((role) => role == item.Role);
          if (!RollUpdate) {
            RollChek.push(item.Role);
          }
          for (let i = 0; i < chief_examiner.length; i++) {
            console.log(
              "Checking chief_examiner:",
              chief_examiner[i],
              item.Eva_Id,
              chief_subcode[i],
              item.subcode,
              Chief_Eva_Subject[i],
              item.Eva_Subject
            );

            if (
              chief_examiner[i] ==
              String(item.Eva_Id || "").replace(/[\r\n\t\s]/g, "") &&
              chief_subcode[i] == item.subcode &&
              Chief_Eva_Subject[i] ==
              String(item.Eva_Subject || "").replace(/[\r\n\t\s]/g, "")
            ) {
              isDuplicate = true;
              console.log(
                "Duplicate chief_examiner entry found, skipping addition."
              );
              break; // Skip to next iteration if all match
            }
          }
          // Append new Dep_Code, chief_subcode, and Chief_Eva_Subject
          if (!isDuplicate) {
            Dep_Code.push(String(item.Dep_Code || "").padStart(2, "0"));
            chief_subcode.push(item.subcode);
            Chief_Eva_Subject.push(
              String(item.Eva_Subject || "").replace(/[\r\n\t\s]/g, "")
            );
            chief_examiner.push(
              String(item.Eva_Id || "").replace(/[\r\n\t\s]/g, "")
            );
            Camp_id_chief.push(item.Camp_id);
            camp_offcer_id_chief.push(item.camp_offcer_id);
            Chief_Valuation_Status.push("N");

            RecrodCnt = RecrodCnt + 1;
            await data_existing.update({
              [Dep_Name_Field]: Dep_Code.join(","),
              Dep_Name_7: Dep_Code.join(","),
              Chief_subcode: chief_subcode.join(","),
              Chief_Eva_Subject: Chief_Eva_Subject.join(","),
              chief_examiner: chief_examiner.join(","),
              Camp_id_chief: Camp_id_chief.join(","),
              camp_offcer_id_chief: camp_offcer_id_chief.join(","),
              Role: RollChek.join(","),
              Chief_Valuation_Status: Chief_Valuation_Status.join(","),
              [User_Roll_Admin]: data_existing[User_Roll_Admin] || (Role_Admin_Data && Role_Admin_Data.rollDescrption ? JSON.parse(Role_Admin_Data.rollDescrption).join(',') : null),
            });
          }
        } else if (item.Role == "2") {
          // Similar logic for Role 2 (examiner)

          Dep_Code = data_existing[Dep_Name_Field]
            ? data_existing[Dep_Name_Field].split(",").map((code) => code.trim())
            : [];
          let subcode = data_existing.subcode
            ? data_existing.subcode.split(",").map((code) => code.trim())
            : [];
          let Eva_Subject = data_existing.Eva_Subject
            ? data_existing.Eva_Subject.split(",").map((code) => code.trim())
            : [];
          let Camp_id = data_existing.Camp_id
            ? data_existing.Camp_id.split(",").map((code) => code.trim())
            : [];
          let camp_offcer_id_examiner = data_existing.camp_offcer_id_examiner
            ? data_existing.camp_offcer_id_examiner.split(",").map((code) => code.trim())
            : [];

          let Sub_Max_Paper = data_existing.Sub_Max_Paper
            ? data_existing.Sub_Max_Paper.split(",").map((code) => code.trim())
            : [];

          let Examiner_Valuation_Status = data_existing.Examiner_Valuation_Status
            ? data_existing.Examiner_Valuation_Status
              .split(",")
              .map((code) => code.trim())
            : [];

          RollChek = data_existing.Role
            ? data_existing.Role.split(",").map((code) => code.trim())
            : [];
          RollUpdate = RollChek.find((role) => role == item.Role);
          if (!RollUpdate) {
            RollChek.push(item.Role);
          }



          for (let i = 0; i < subcode.length; i++) {
            console.log(
              "Checking Eva_Id:",
              subcode[i],
              item.subcode,
              Eva_Subject[i],
              item.Eva_Subject
            );
            if (
              subcode[i] == item.subcode &&
              Eva_Subject[i] ==
              String(item.Eva_Subject || "").replace(/[\r\n\t\s]/g, "")
            ) {
              isDuplicate = true;
              console.log("Duplicate examiner entry found, skipping addition.");
              break; // Skip to next iteration if all match
              //continue
            }
          }

          // Append new Dep_Code, subcode, and Eva_Subject
          if (!isDuplicate) {
            Dep_Code.push(String(item.Dep_Code || "").padStart(2, "0"));
            subcode.push(item.subcode);
            Eva_Subject.push(
              String(item.Eva_Subject || "").replace(/[\r\n\t\s]/g, "")
            );
            Camp_id.push(item.Camp_id);
            // console.log("camp_offcer_id_examiner", camp_offcer_id_examiner, item.camp_offcer_id);

            camp_offcer_id_examiner.push(item.camp_offcer_id);
            console.log("camp_offcer_id_examiner after push", camp_offcer_id_examiner);
            Sub_Max_Paper.push(item.Sub_Max_Paper || "0");
            Examiner_Valuation_Status.push("N");
            RecrodCnt = RecrodCnt + 1;
            await data_existing.update({
              [Dep_Name_Field]: Dep_Code.join(","),
              subcode: subcode.join(","),
              Eva_Subject: Eva_Subject.join(","),
              Camp_id: Camp_id.join(","),
              camp_offcer_id_examiner: camp_offcer_id_examiner.join(","),
              Role: RollChek.join(","),
              Sub_Max_Paper: Sub_Max_Paper.join(","),
              Examiner_Valuation_Status: Examiner_Valuation_Status.join(","),
              [User_Roll_Admin]: data_existing[User_Roll_Admin] || (Role_Admin_Data && Role_Admin_Data.rollDescrption ? JSON.parse(Role_Admin_Data.rollDescrption).join(',') : null),
            });
          }
        } else if (item.Role == "4") {
          Dep_Code = data_existing[Dep_Name_Field]
            ? data_existing[Dep_Name_Field].split(",").map((code) => code.trim())
            : [];
          Camp_id_Camp = data_existing.Camp_id_Camp
            ? data_existing.Camp_id_Camp.split(",").map((code) => code.trim())
            : [];
          Camp_id_Camp_Check = Camp_id_Camp.find((camp) => camp == item.Camp_id);
          if (!Camp_id_Camp_Check) {
            Camp_id_Camp.push(item.Camp_id);
          }
          RollChek = data_existing.Role
            ? data_existing.Role.split(",").map((code) => code.trim())
            : [];
          RollUpdate = RollChek.find((role) => role == item.Role);
          if (!RollUpdate) {
            RollChek.push(item.Role);
          }
          Dep_Code.push(String(item.Dep_Code || "").padStart(2, "0"));
          await data_existing.update({
            [Dep_Name_Field]: Dep_Code.join(","),
            Camp_id_Camp: Camp_id_Camp.join(","),
            Role: RollChek.join(",")
          });

        } else {
          Dep_Code = data_existing[Dep_Name_Field]
            ? data_existing[Dep_Name_Field].split(",").map((code) => code.trim())
            : [];
          RollChek = data_existing.Role
            ? data_existing.Role.split(",").map((code) => code.trim())
            : [];
          RollUpdate = RollChek.find((role) => role == item.Role);
          if (!RollUpdate) {
            RollChek.push(item.Role);
          }
          RecrodCnt = RecrodCnt + 1;
          await data_existing.update({
            Role: RollChek.join(","),
            [Dep_Name_Field]: Dep_Code.join(","),
            [User_Roll_Admin]: data_existing[User_Roll_Admin] || (Role_Admin_Data && Role_Admin_Data.rollDescrption ? JSON.parse(Role_Admin_Data.rollDescrption).join(',') : null),
          });
        }
        // console.log("Duplicate Eva_Id found:", item.Eva_Id);
        // Error_responseData.push({
        //   Eva_Id: item.Eva_Id,
        //   Dep_Name: item.Dep_Code,
        //   Error_Message: "Eva_Id already exists in the database",
        //   ErrorFlag: true,
        // });
      }
    }
    res.status(200).json({
      Error_responseData,
      ErrorFlag,
      RecrodCnt,
      TotalRecordCnt
    });


  } else if (uploadFileType == "3") {
    let ErrorFlag = false;
    console.log("Subject Master Data Upload Started");
    const degreeName = req.body.degreeName;
    console.log("Excel Data Received for Subject Master:", degreeName);
    TotalRecordCnt = excelData.length;
    for (let index = 0; index < excelData.length; index++) {

      if (degreeName && String(excelData[index].Dep_Code || "").padStart(2, "0") !== String(degreeName).padStart(2, "0")) {
        ErrorFlag = true;
        Error_responseData.push({
          Subcode: excelData[index].Subcode,
          SUBNAME: excelData[index].Subname,
          Error_Message: `Department code does not match the specified degree name ${degreeName}`,
        });
        continue; // Skip records that don't match the specified degreeName
      }

      let item = excelData[index];
      let keyChk = String(item.Subcode || "").replace(/[\r\n\t\s]/g, "");
      data_existing = await sub_master.findOne({
        where: { Subcode: keyChk },
      });
      if (!data_existing) {
        RecrodCnt = RecrodCnt + 1;
        await sub_master.create({
          Subcode: String(item.Subcode || "").replace(/[\r\n\t\s]/g, ""),
          SUBNAME: item.Subname,
          Rate_Per_Script: item.Rate_Per_Script,
          Min_Amount: item.Min_Amount,
          Valcnt: item.Valcnt,
          Degree_Status: item.Degree_Status,
          Type_of_Exam: item.Type_of_Exam,
          Dep_Name: String(item.Dep_Code).padStart(2, "0"),
          Eva_Mon_Year: `${semMonth}_${semYear}`,
        });
      } else {
        console.log("Duplicate Subcode found:", item.Subcode);
        ErrorFlag = true;
        Error_responseData.push({
          Subcode: item.Subcode,
          SUBNAME: item.Subname,
          Error_Message: "Subcode already exists in the database",
        });
      }
    }
    res.status(200).json({
      Error_responseData,
      ErrorFlag,
      RecrodCnt,
      TotalRecordCnt
    });




  } else if (uploadFileType == "4") {
    let ErrorFlag = false;
     const degreeName = req.body.degreeName;
    TotalRecordCnt = excelData.length;
    for (let index = 0; index < excelData.length; index++) {
        if (degreeName && String(excelData[index].Dep_Code || "").padStart(2, "0") !== String(degreeName).padStart(2, "0")) {
        ErrorFlag = true;
        Error_responseData.push({
          Dep_Code: excelData[index].Dep_Code,
          sub_code: excelData[index].sub_code,
          qstn_num: excelData[index].qstn_num,
          max_mark: excelData[index].max_mark,
          section: excelData[index].section,
          sub_section: excelData[index].sub_section,
          add_sub_section: excelData[index].add_sub_section,
          Error_Message: `Department code does not match the specified degree name ${degreeName}`,
        });
        continue; // Skip records that don't match the specified degreeName
      }
      let item = excelData[index];
      let keyChk = String(item.Dep_Code).padStart(2, "0");
      let sub_code = String(item.sub_code || "").replace(/[\r\n\t\s]/g, "");
      let qstn_num = String(item.qstn_num || "").replace(/[\r\n\t\s]/g, "");
      let max_mark = String(item.max_mark || "").replace(/[\r\n\t\s]/g, "");
      let section = String(item.section || "").replace(/[\r\n\t\s]/g, "");
      let sub_section = String(item.sub_section || "").replace(
        /[\r\n\t\s]/g,
        ""
      );
      let add_sub_section = String(item.add_sub_section || "").replace(
        /[\r\n\t\s]/g,
        ""
      );
      let wherecondition = {};
      wherecondition.Dep_Name = keyChk;
      wherecondition.sub_code = sub_code;
      wherecondition.qstn_num = qstn_num;
      wherecondition.max_mark = max_mark;
      wherecondition.section = section;
      if (sub_section) wherecondition.sub_section = sub_section;
      if (add_sub_section) wherecondition.add_sub_section = add_sub_section;
      data_existing = await valid_sections.findOne({
        where: wherecondition,
      });

      if (!data_existing) {
        RecrodCnt = RecrodCnt + 1;
        await valid_sections.create({
          Dep_Name: keyChk,
          sub_code: sub_code,
          qstn_num: qstn_num,
          max_mark: max_mark,
          section: section,
          sub_section: sub_section,
          add_sub_section: add_sub_section,
          Eva_Mon_Year: `${semMonth}_${semYear}`,
          BL_Point: item.BL_Point,
          CO_Point: item.CO_Point,
          PO_Point: item.PO_Point,
        });
      } else {
        console.log("Duplicate valid_section found:", item.sub_code);
        ErrorFlag = true;
        Error_responseData.push({
          Dep_Code: item.Dep_Code,
          sub_code: item.sub_code,
          qstn_num: item.qstn_num,
          max_mark: item.max_mark,
          section: item.section,
          sub_section: item.sub_section,
          add_sub_section: item.add_sub_section,
          Error_Message: "valid_section already exists in the database",
        });
      }
    }
    res.status(200).json({
      Error_responseData,
      ErrorFlag,
      RecrodCnt,
      TotalRecordCnt
    });
  } else if (uploadFileType == "5") {
    let ErrorFlag = false;
      const degreeName = req.body.degreeName;
    TotalRecordCnt = excelData.length;
    for (let index = 0; index < excelData.length; index++) {
        if (degreeName && String(excelData[index].Dep_Code || "").padStart(2, "0") !== String(degreeName).padStart(2, "0")) {
        ErrorFlag = true;
        Error_responseData.push({
          Dep_Code: excelData[index].Dep_Code,
          SUBCODE: excelData[index].SUBCODE,
          SECTION: excelData[index].SECTION,
          FROM_QST: excelData[index].FROM_QST,
          TO_QST: excelData[index].TO_QST,
          SUB_SEC: excelData[index].SUB_SEC,
          Error_Message: `Department code does not match the specified degree name ${degreeName}`,
        });
        continue; // Skip records that don't match the specified degreeName
      }
      let item = excelData[index];
      let keyChk = String(item.Dep_Code).padStart(2, "0");
      let subcode = String(item.SUBCODE || "").replace(/[\r\n\t\s]/g, "");
      let subsecion = String(item.SECTION || "").replace(/[\r\n\t\s]/g, "");
      let subFromSection = String(item.FROM_QST || "").replace(
        /[\r\n\t\s]/g,
        ""
      );
      let subToSection = String(item.TO_QST || "").replace(/[\r\n\t\s]/g, "");
      let subSubSection = String(item.SUB_SEC || "").replace(/[\r\n\t\s]/g, "");
      wherecondition = {};
      wherecondition.Dep_Name = keyChk;
      wherecondition.SUBCODE = subcode;
      wherecondition.SECTION = subsecion;
      wherecondition.FROM_QST = subFromSection;
      wherecondition.TO_QST = subToSection;
      wherecondition.SUB_SEC = subSubSection;

      console.log("Processing valid_question:", wherecondition);

      data_existing = await valid_question.findOne({
        where: wherecondition,
      });
      if (!data_existing) {
        // // Format month and year as "Jan-2026"
        // const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        // const evaMonth = item.Eva_Month ? monthNames[parseInt(item.Eva_Month) - 1] : null;
        // const evaYear = item.Eva_Year ? String(item.Eva_Year) : null;
        RecrodCnt = RecrodCnt + 1;
        await valid_question.create({
          Dep_Name: keyChk,
          SUBCODE: subcode,
          SECTION: subsecion,
          FROM_QST: subFromSection,
          TO_QST: subToSection,
          SUB_SEC: subSubSection,
          MARK_MAX: item.MARK_MAX,
          NOQST: item.NOQST,
          C_QST: item.C_QST,
          Eva_Mon_Year: `${semMonth}_${semYear}`,
        });
      } else {
        ErrorFlag = true;
        console.log("Duplicate Department Master found:", item.Dep_Code);
        Error_responseData.push({
          Dep_Code: item.Dep_Code,
          SUBCODE: item.SUBCODE,
          Error_Message: "Department Master already exists in the database",
        });
      }
    }
    res.status(200).json({
      Error_responseData,
      ErrorFlag,
      RecrodCnt,
      TotalRecordCnt
    });
  } else if (uploadFileType == 13) {
    let ErrorFlag = false;
    TotalRecordCnt = excelData.length;
    for (let index = 0; index < excelData.length; index++) {
      let item = excelData[index];

      let keyChk = String(item.Employee_Code || "").replace(/[\r\n\t\s]/g, "");
      data_existing = await staff_master.findOne({
        where: { Eva_Id: keyChk },
      });
      if (!data_existing) {
        RecrodCnt = RecrodCnt + 1;
        await staff_master.create({
          Eva_Id: String(item.Employee_Code || "").replace(/[\r\n\t\s]/g, ""),
          FACULTY_NAME: item.Employee_Name,
          DESIGNATION: item.Designation,
          Email_Id: item.Email,
          Mobile_Number: item.Mobile_Number,
        });
      } else {
        console.log("Duplicate Employee_Code found:", item.Employee_Code);
        Error_responseData.push({
          Employee_Code: item.Employee_Code,
          Staff_Name: item.Staff_Name,
          Error_Message: "Employee_Code already exists in the database",
          ErrorFlag: true,
        });
      }
    }
    res.status(200).json({
      Error_responseData,
      ErrorFlag,
      RecrodCnt,
      TotalRecordCnt
    });
  } else if (uploadFileType == 14) {


    TotalRecordCnt = excelData.length;
    console.log("Received Import Logs:", excelData);
    console.log("Processing Import Logs, total records:", TotalRecordCnt);
    for (let index = 0; index < excelData.length; index++) {
      let item = excelData[index];
      let flname = `import${item.Valuvation}`;
      const data_Update = await db[flname].update({
        Checked: "NO",
        E_flg: "A",
        tflg: "A",

        Evaluator_Id: String(item.Eva_Id || "").replace(/[\r\n\t\s]/g, ""),

      }, {
        where: {
          barcode: String(item.Dummy || "").replace(/[\r\n\t\s]/g, ""),
          subcode: String(item.SubCode || "").replace(/[\r\n\t\s]/g, ""),
        },
      });

      if (!data_Update) {
        console.log(`No records updated for barcode: ${item.Dummy}, subcode: ${item.SubCode} in table ${flname}`);
        Error_responseData.push({
          barcode: item.Dummy,
          subcode: item.SubCode,
          Error_Message: `No matching record found to update in ${flname}`,
        });
        ErrorFlag = true;
      } else {
        RecrodCnt = RecrodCnt + 1;
      }

    }
    console.log("Import Logs processing completed. Total records processed:", TotalRecordCnt, "Successful updates:", RecrodCnt, "Errors:", Error_responseData.length);
    res.status(200).json({
      Error_responseData,
      ErrorFlag,
      RecrodCnt,
      TotalRecordCnt

    });

  } else if (uploadFileType == 6) {

    const Faculty_Data = await faculties.findAll({
    });
    console.log("Fetched Faculty Data:", Faculty_Data);
    const DateTime_Now = getCurrentISTDateTime();

    TotalRecordCnt = excelData.length;
    for (let index = 0; index < excelData.length; index++) {
      let item = excelData[index];
      let subcode = String(item.SubjectCode || "").replace(/[\r\n\t\s]/g, "");
      let DummyNo = String(item.Dummy_NO || "").replace(/[\r\n\t\s]/g, "");
      let flname = `import${item.Valuation_Type}`;

      const Import_Data = await db[flname].findOne({
        where: {
          barcode: DummyNo,
          subcode: subcode,
        },
      });
      if (Import_Data) {
        RecrodCnt = RecrodCnt + 1;


        const existingReviewData = await db.student_result_data.findOne({
          where: {
            Dummy_NO: Import_Data.barcode,
            SubjectCode: Import_Data.subcode,
            Valuation_Type: item.Valuation_Type,
          }
        })
        console.log()
        if (!existingReviewData) {
          let Faculty_Row = Faculty_Data.find(faculty => { const Eva_Id = String(Import_Data.Evaluator_Id || "").replace(/[\r\n\t\s]/g, ""); return faculty.Eva_Id === Eva_Id });
          console.log("Matching Faculty Data for Evaluator_Id:", Import_Data.Evaluator_Id, Faculty_Row);
          await db.student_result_data.create({
            Dummy_NO: Import_Data.barcode,
            RegisterNo: item.RegisterNo,
            SubjectCode: Import_Data.subcode,
            Dep_Name: Import_Data.Dep_Name,
            Eva_Mon_Year: Import_Data.Eva_Mon_Year,
            Evaluator_Id: Import_Data.Evaluator_Id,
            FACULTY_NAME: Faculty_Row ? Faculty_Row.FACULTY_NAME : null,
            Mobile_Number: Faculty_Row ? Faculty_Row.Mobile_Number : null,
            Email_Id: Faculty_Row ? Faculty_Row.Email_Id : null,
            Import_Date: DateTime_Now,
            Valuation_Type: item.Valuation_Type,
          });

        } else {
          ErrorFlag = true;
          console.log(`No matching record found for Dummy No: ${DummyNo}, Subcode: ${subcode} in table ${flname}`);
          Error_responseData.push({
            Dummy_NO: DummyNo,
            subcode: subcode,
            Error_Message: `No matching record found for Dummy No: ${DummyNo}, Subcode: ${subcode} in table ${flname}`,
          });
        }

      } else {
        ErrorFlag = true;
        Error_responseData.push({
          Dummy_NO: String(item.Dummy_NO || "").replace(/[\r\n\t\s]/g, ""),
          subcode: String(item.SubjectCode || "").replace(/[\r\n\t\s]/g, ""),
          Error_Message: `No matching record found for Dummy No: ${item.Dummy_NO}, Subcode: ${item.SubjectCode} in table import${item.Valuation_Type}`,
        });
      }
    }
    res.status(200).json({
      Error_responseData,
      ErrorFlag,
      RecrodCnt,
      TotalRecordCnt
    });
  } else {
    res.status(200).json({
      Error_responseData,
      ErrorFlag,
      RecrodCnt,
      TotalRecordCnt
    });
  }
});

const sampleFileDownload = (req, res, next) => {
  console.log("Download request received", req.query);
  const { fileName } = req.query;

  if (!fileName) {
    return res.status(400).json({
      success: false,
      message: "File name is required",
    });
  }

  const path = require("path");
  const fs = require("fs");
  const filePath = path.join(__dirname, "../sample-files", fileName);

  console.log("Attempting to download file:", filePath);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    return res.status(404).json({
      success: false,
      message: "File not found",
    });
  }

  const stat = fs.statSync(filePath);
  console.log("File size:", stat.size, "bytes");

  // Use res.download which handles everything properly
  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      // Only send error if headers haven't been sent
      if (!res.headersSent) {
        next(err);
      }
    } else {
      console.log("File downloaded successfully:", fileName);
    }
  });
};

const Image_Check = asyncHandler(async (req, res) => {
  ErrorFlag = false;
  let Error_responseData = [];
  for (let i = 1; i <= 4; i++) {
    const tableName = `import${i}`;
    const records = await db[tableName].findAll({
      where: {
        E_flg: "I",
      },
    });

    for (const record of records) {
      const batchname = record.batchname;
      const Eva_Mon_Year = record.Eva_Mon_Year;
      const Dep_Name = record.Dep_Name;
      const fs = require("fs");
      const path = require("path");
      const imageDir = path.join(
        __dirname,
        "..",
        "uploads",
        Eva_Mon_Year,
        "ImgImp",
        Dep_Name,
        batchname
      );

      if (fs.existsSync(imageDir)) {
        const files = fs.readdirSync(imageDir);
        const imageCount = files.length;
        if (imageCount >= parseInt(record.ImgCnt)) {
          await record.update({ E_flg: "N" });
          console.log(
            `Images verified for batchname: ${batchname}, images found: ${imageCount}`
          );
        }
        else {
          Error_responseData.push({
            batchname: batchname,
            Dep_Name: Dep_Name,
            subcode: record.subcode,
            Error_Message: `Insufficient images. Expected: ${record.ImgCnt}, Found: ${imageCount}`,
          });
          console.log(
            `Insufficient images for batchname: ${batchname}. Expected: ${record.ImgCnt}, Found: ${imageCount}`
          );
          ErrorFlag = true;
        }
      } else {
        Error_responseData.push({
          batchname: batchname,
          Dep_Name: Dep_Name,
          subcode: record.subcode,
          Error_Message: "Image directory does not exist",
        });
        console.log(`Image directory does not exist: ${imageDir}`);
        ErrorFlag = true;
      }
    }
  }

  if (ErrorFlag == false) {
    res.status(200).json({
      message: "All images verified successfully",
      Error_responseData,
      ErrorFlag
    });
  } else {
    res.status(200).json({ Error_responseData, ErrorFlag });
  }
});

const getSubjectCode = asyncHandler(async (req, res) => {

  const { Dep_Name } = req.query;

  const subjects = await sub_master.findAll({
    where: {
      Dep_Name: Dep_Name,
    },
    attributes: ["Subcode", "SUBNAME"],
  });

  res.status(200).json(subjects);

});

const getTableCount = asyncHandler(async (req, res) => {

  const [import1Count, facultiesCount, subMasterCount, validSectionsCount, validQuestionCount] = await Promise.all([
    db.import1.count(),
    faculties.count(),
    sub_master.count(),
    valid_sections.count(),
    valid_question.count()
  ]);

  const tableCounts = {
    import1: import1Count,
    faculties: facultiesCount,
    sub_master: subMasterCount,
    valid_sections: validSectionsCount,
    valid_question: validQuestionCount
  };

  res.status(200).json(tableCounts);

});

module.exports = {
  exgeneralMasterData,
  sampleFileDownload,
  Image_Check,
  getSubjectCode,
  getTableCount,
};
