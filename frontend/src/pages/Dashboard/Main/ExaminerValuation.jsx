import React, { useEffect, useMemo } from "react";
import UploadPageLayout from "../../../components/DashboardComponents/UploadPageLayout";
import { Card } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useGetValuationfetchDataQuery } from "../../../redux-slice/userDashboardSlice";
import ExaminerDashboard from "../Dashboard/ExaminerDashboard";
import ChiefDashboard from "../Dashboard/ChiefDashboard.jsx";
import McqOperationData from "../../../components/McqOperation/McqOperationData.jsx";
import { useGetCommonDataQuery } from '../../../redux-slice/getDataCommonRouterdata';

const ExaminerValuation = () => {
  const userInfo = useSelector((state) => state.auth.userInfo);
  const Dep_Name = useSelector((state) => state?.auth?.userInfo?.selected_course);

  const { data: SubCodedata, error: error2 } = useGetCommonDataQuery(
    { tableId: 'sub_master', Dep_Name },
    { skip: !Dep_Name }
  );

  useEffect(() => {
    if (error2) {
      console.error("Error fetching sub_master data: ", error2);
    }
  }, [error2]);

  const Eva_id = useSelector((state) => state.auth.userInfo.username);

  // Filter data where mcq_flg is "Y", Eva_Id matches current user, and mcq_updates is not 'Y'
  const filteredMcqData = useMemo(() => {
    if (!SubCodedata?.data || !Array.isArray(SubCodedata.data)) return [];
    return SubCodedata.data.filter(item =>
      item.mcq_flg === "Y" &&
      item.Eva_Id == Eva_id &&
      item.mcq_updates !== 'Y'
    );
  }, [SubCodedata, Eva_id]);

  const userHeader = userInfo.selected_role == 2 ? "Examiner & Review" : "Chief Examiner & Review";

  const LoginUserRole = userInfo.selected_role;
  let basicDepartment = `Dep_Name_${userInfo.selected_role}`;
  const basic_info_data = {
    department: userInfo[basicDepartment] || "",
    role: userInfo.role || "",
    subcode: userInfo.subcode || "",
    Eva_Subject: userInfo.Eva_Subject || "",
    Max_Papers_subject: userInfo.Max_Papers_subject || "0",
    Sub_Max_Papers: userInfo.Sub_Max_Papers || "",
    chief_examiner: userInfo.chief_examiner || "",
    Chief_subcode: userInfo.Chief_subcode || "",
    Chief_Eva_Subjects: userInfo.Chief_Eva_Subjects || "",
    Camp_id: userInfo.Camp_id || "",
    camp_offcer_id_examiner: userInfo.camp_offcer_id_examiner || "",
    Camp_id_chief: userInfo.Camp_id_chief || "",
    camp_offcer_id_chief: userInfo.camp_offcer_id_chief || "",
    Examiner_Valuation_Status: userInfo.Examiner_Valuation_Status || "",
    Chief_Valuation_Status: userInfo.Chief_Valuation_Status || "",
    Dep_Name: userInfo.selected_course || "",
    rolefinal: userInfo.selected_role || ""
  };


  const {
    data: dataFromSubcodeTest,
    error,
  } = useGetValuationfetchDataQuery(basic_info_data);



  useEffect(() => {
    if (error) {
      console.error("Error fetching valuation data: ", error);
    }
  }, [error]);

  // Render MCQ interface if examiner has any MCQ subjects assigned
  const hasMcqSubjects = filteredMcqData.length > 0;

  if (hasMcqSubjects) {
    return (
      <McqOperationData />
    );
  }

  return (
    <UploadPageLayout
      mainTopic={userHeader}
      subTopic="Comprehensive overview and management of examiner valuations"
      cardTitle="Valuation Details"
    >
      <div style={{ width: '100%' }}>
        {dataFromSubcodeTest?.subcode_subjects &&
          dataFromSubcodeTest.subcode_subjects.length > 0 &&
          LoginUserRole == 2 ? (
          <ExaminerDashboard
            Examiner_data={dataFromSubcodeTest.subcode_subjects}
            user_Info={userInfo}
          />
        ) : dataFromSubcodeTest?.chief_subcode_subjects &&
          dataFromSubcodeTest.chief_subcode_subjects.length > 0 &&
          (LoginUserRole == 7 || LoginUserRole == 1) ? (
          <>
            <ChiefDashboard
              Chief_data={dataFromSubcodeTest.chief_subcode_subjects}
              user_Info={userInfo}
            />
          </>
        ) : (
          <div className="text-center p-5">
            <Card style={{
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              borderRadius: '16px'
            }}>
              <Card.Body className="py-5">
                <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>No subcodes assigned.</p>
              </Card.Body>
            </Card>
          </div>
        )}
      </div>
    </UploadPageLayout>
  );
};

export default ExaminerValuation;
