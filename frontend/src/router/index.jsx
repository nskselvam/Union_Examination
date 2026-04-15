import React, { lazy, Suspense } from "react";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Navigate } from "react-router-dom"

// Eager load critical components
import Renderpage from "../render/Renderpage.jsx";  
import Protected from "../private/Protected.jsx"
import IPCheckWrapper from "../private/IPCheckWrapper.jsx"
import ErrorBoundary from '../components/ErrorBoundary.jsx'
import TermsConditionsModal from "../components/modals/TermsConditionsModal.jsx";

// Lazy load all pages for better code splitting
const Login = lazy(() => import("../pages/Login/Login.jsx"));
const ResetPassword = lazy(() => import("../pages/reset_password/ResetPassword.jsx"));
const CommonDashboar = lazy(() => import("../pages/Dashboard/Common/CommonDashboar.jsx"));
const AdminMainDashboard = lazy(() => import("../pages/Dashboard/Admin/AdminMainDashboard.jsx"));
const ExcelTextUpload = lazy(() => import("../pages/ExcelTextUpload/ExcelTextUpload.jsx"));
const IpConfig = lazy(() => import("../pages/Dashboard/utility/IpConfig.jsx"));
const ExaminerValuation = lazy(() => import("../pages/Dashboard/Main/ExaminerValuation.jsx"));
const ValuationMain = lazy(() => import("../pages/Valuation/ValuationMain.jsx"));
const ValuationchiefMain = lazy(() => import("../pages/Valuation/ValuationchiefMain.jsx"));
const PdfDocument = lazy(() => import("../pages/PdfPrint_Examiner/PdfDocument.jsx"));
const PdfDocumentCamp = lazy(() => import("../pages/PdfPrint_Examiner/PdfDocumentCamp.jsx"));
const ExaminerMarkpdf = lazy(() => import("../pages/PdfPrint_Examiner/ExaminerPaypdf.jsx"));
const ExaminerReview = lazy(() => import("../pages/Dashboard/Examinerreview/ExaminerReview.jsx"));
const ReviewExaminer = lazy(() => import("../pages/Dashboard/Review/ReviewExaminer.jsx"));
const ChiefValuationReview = lazy(() => import("../pages/Dashboard/Examinerreview/ChiefValuationReview.jsx"));
const ChiefValuationReviewMain = lazy(() => import("../pages/Dashboard/Review/ChiefValuationReviewMain.jsx"));
const ReviwChiefMain = lazy(() => import("../pages/Valuation/ReviwChiefMain.jsx"));
const Userrolemaster = lazy(() => import("../pages/Dashboard/UserRoleMaster/Userrolemaster.jsx"));
const SubjectMaster = lazy(() => import("../pages/Dashboard/SubjectMaster/SubjectMaster.jsx"));
const Valid_Qbs_Master = lazy(() => import("../pages/Dashboard/Valid_Qbs/Valid_Qbs_Master.jsx"));
const Valid_Selection = lazy(() => import("../pages/Dashboard/valid_subject/Valid_Selection.jsx"));
const Qp_and_answerKey = lazy(() => import("../pages/Dashboard/QpAndAnswerKey/Qp_and_answerKey.jsx"));
const Qp_and_AnswerKey_upload = lazy(() => import("../pages/Dashboard/QpAndAnswerKey/Qp_and_AnswerKey_upload.jsx"));
const Camp_Details = lazy(() => import("../pages/Dashboard/ValuationStatus/Camp_Details.jsx"));
const ExaminerResetPassword = lazy(() => import("../pages/examiner/resetPassword.jsx"));
const UserPassword = lazy(() => import("../pages/examiner/userPassword.jsx"));
const PagenotFound = lazy(() => import("../pages/Dashboard/Pagenotfound/PagenotFound.jsx"));
const Examiner_Alteration = lazy(() => import("../pages/Alteration/Examiner_Alteration.jsx"));
const Chief_Examiner_Alteration = lazy(() => import("../pages/Alteration/Chief_Examiner_Alteration.jsx"));
const Subcode_Details = lazy(() => import("../pages/Dashboard/ValuationStatus/Subcode_Details.jsx"));
const ExaminerSubcode_Details = lazy(() => import("../pages/Dashboard/ValuationStatus/ExaminerSubcode_Details.jsx"));
const ChiefSubcode_Details = lazy(() => import("../pages/Dashboard/ValuationStatus/ChiefSubcode_Details.jsx"));
const RemarksMalpracticeDetails = lazy(() => import("../pages/Dashboard/ValuationStatus/RemarksMalpracticeDetails.jsx"));
const ExaminerPendingDetails = lazy(() => import("../pages/Dashboard/ValuationStatus/ExaminerPendingDetails.jsx"));
const DepartmentMaster = lazy(() => import("../pages/BasicData/DepartmentMaster.jsx"));
const MonthYearMaster = lazy(() => import("../pages/BasicData/MonthYearMaster.jsx"));
const FacultChecking = lazy(() => import("../pages/BasicData/FacultChecking.jsx"));
const Subcode_Examiner_Details = lazy(() => import("../pages/Dashboard/ValuationStatus/Subcode_Examiner_Details.jsx"));
const PaperReviewexaminer = lazy(() => import("../pages/PaperReview/PaperReviewexaminer.jsx"));
const PaperReiewzero = lazy(() => import("../pages/PaperReview/PaperReiewzero.jsx"));
const ValuationCancel = lazy(() => import("../pages/ValuatrionCancel/ValuationCancel.jsx"));
const DataExport = lazy(() => import("../pages/ExportData/DataExport.jsx"));
const ValuationMove = lazy(() => import("../pages/Dashboard/ValuationMove/ValuationMove.jsx"));
const ScanningChecking = lazy(() => import("../pages/ScanningChecking/ScanningChecking.jsx"));
const DataBackup = lazy(() => import("../pages/Databackup/DataBackup.jsx"));
const McqmasterUpdate = lazy(() => import("../pages/McqMaster/McqmasterUpdate.jsx"));
const ExaminerPaymentReport = lazy(() => import("../pages/PayPrint/ExaminerPaymentReport.jsx"));
const Resetpassword = lazy(() => import("../pages/Resetpassword/Resetpassword.jsx"));
const ProfileUser = lazy(() => import("../pages/profile/ProfileUser.jsx"));
const AdminWindowsql = lazy(() => import("../pages/adminwindow/AdminWindowsql.jsx"));
const McqExport = lazy(() => import("../pages/McqMaster/McqExport.jsx"));
const Userollmaster = lazy(() => import("../pages/UserRoll/Userollmaster.jsx"));
const Navbaradd = lazy(() => import("../pages/UserRoll/Navbaradd.jsx"));
const Rollmaster = lazy(() => import("../pages/UserRoll/Rollmaster.jsx"));
const RollexaminerUpdate = lazy(() => import("../pages/UserRoll/RollexaminerUpdate.jsx"));
const ChiefRemarks = lazy(() => import("../pages/chiefRemarks/ChiefRemarks.jsx"));
const AttendanceSheet = lazy(() => import("../pages/Dashboard/Common/AttendanceSheet.jsx"));
const ConsolidatedPaymentDetails = lazy(() => import("../pages/PayPrint/ConsolidatedPaymentDetails.jsx"));
const DatTaAllowance = lazy(() => import("../pages/DaTaAllowance/DatTaAllowance.jsx"));
// Loading fallback component
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    fontSize: '14px',
    color: '#666'
  }}>
    <div>Loading...</div>
  </div>
);

// Wrapper for lazy routes
const LazyRoute = ({ Component }) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

//import ValuationMove from "../pages/Dashboard/ValuationMove/ValuationMove.jsx";
//import for all the files in routing


//router export
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Renderpage />}>
      <Route element={<IPCheckWrapper />}>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LazyRoute Component={Login} />} />
        <Route element={<Protected />}>
          <Route path="/reset-password" element={<LazyRoute Component={ResetPassword} />} />
          <Route path="/common/dashboard" element={<LazyRoute Component={CommonDashboar} />} />
          <Route path="/admin/dashboard" element={<LazyRoute Component={AdminMainDashboard} />} />
          <Route path="/excel-text-upload" element={<LazyRoute Component={ExcelTextUpload} />} />
          <Route path="/ip-config" element={<LazyRoute Component={IpConfig} />} />
          <Route path="/examiner/valuation-review" element={<LazyRoute Component={ExaminerValuation} />} />
          <Route path="/valuation" element={<LazyRoute Component={ValuationMain} />} />
          <Route path="/valuation/chief-valuation" element={<LazyRoute Component={ValuationchiefMain} />} />
          <Route path="/Evaluator/PrintPdf" element={<LazyRoute Component={PdfDocument} />} />
          <Route path="/Evaluator/Payment" element={<LazyRoute Component={ExaminerMarkpdf} />} />
          <Route path="/examiner/review" element={<LazyRoute Component={ExaminerReview} />} />
          <Route path="/examiner/reviewe/valuationreview" element={<LazyRoute Component={ReviewExaminer} />} />
          <Route path="/valuation/chief-valuation-review-main" element={<LazyRoute Component={ChiefValuationReviewMain} />} />
          <Route path="/valuation/chief-valuation-review" element={<LazyRoute Component={ChiefValuationReview} />} />
          <Route path="/valuation/chief-review" element={<LazyRoute Component={ReviwChiefMain} />}/>
          <Route path="/admin/userMaster" element={<LazyRoute Component={Userrolemaster} />}/>
          <Route path="/admin/subject_master_dashboard" element={<LazyRoute Component={SubjectMaster} />}/>
          <Route path="/admin/valid_qbs_master" element={<LazyRoute Component={Valid_Qbs_Master} />}/>
          <Route path="/admin/valid_selection" element={<LazyRoute Component={Valid_Selection} />}/>
          <Route path="/admin/qp_and_answerkey" element={<LazyRoute Component={Qp_and_answerKey} />}/>
          <Route path="/admin/qp_and_answerkey_upload" element={<LazyRoute Component={Qp_and_AnswerKey_upload} />}/>
          <Route path="/admin/camp_details" element={<LazyRoute Component={Camp_Details} />}/>
          <Route path="/examiner/resetpassword" element={<LazyRoute Component={ExaminerResetPassword} />} />
          <Route path="/examiner/userpassword" element={<LazyRoute Component={UserPassword} />} />
          <Route path='/examiner_alteration' element={<LazyRoute Component={Examiner_Alteration} />} /> 
          <Route path='/chief_examiner_alteration' element={<LazyRoute Component={Chief_Examiner_Alteration} />} />
          <Route path='/admin/subcode_details' element={<LazyRoute Component={Subcode_Details} />} />
          <Route path='/admin/examiner_subcode_details' element={<LazyRoute Component={ExaminerSubcode_Details} />} />
          <Route path='/admin/remarks_malpractice' element={<LazyRoute Component={RemarksMalpracticeDetails} />} />
          <Route path='/admin/chief_subcode_details' element={<LazyRoute Component={ChiefSubcode_Details} />} />
          <Route path='/admin/paper_locked_pending' element={<LazyRoute Component={ExaminerPendingDetails} />} />
          <Route path="/admin/degree-master" element={<LazyRoute Component={DepartmentMaster} />} />
          <Route path="/admin/month-year" element={<LazyRoute Component={MonthYearMaster} />} />
          <Route path="/admin/faculty-checking" element={<LazyRoute Component={FacultChecking} />} />
          <Route path="/admin/subcode_evaluation_status_examiner" element={<LazyRoute Component={Subcode_Examiner_Details} />} />
          <Route path="/paper-review-data" element={<LazyRoute Component={PaperReviewexaminer} />} />
          <Route path="/paper-review-zero" element={<LazyRoute Component={PaperReiewzero} />} />
          <Route path="/admin/valuation-cancel" element={<LazyRoute Component={ValuationCancel} />} />
          <Route path="/admin/export-data" element={<LazyRoute Component={DataExport} />} />
          <Route path="/admin/valuation-move" element={<LazyRoute Component={ValuationMove} />} />
          <Route path="/admin/scanning-valuation-data" element={<LazyRoute Component={ScanningChecking} />} />
          <Route path="/admin/data-backup" element={<LazyRoute Component={DataBackup} />} />
          <Route path="/master/mcqmaster-update" element={<LazyRoute Component={McqmasterUpdate} />} />
          <Route path="/Evaluator/examiner-payment-report" element={<LazyRoute Component={ExaminerPaymentReport} />} />
          <Route path ="/change-password" element={<LazyRoute Component={Resetpassword} />} />
          <Route path ="/profile" element={<LazyRoute Component={ProfileUser} />} />
          <Route path="/admin/admin-window" element={<LazyRoute Component={AdminWindowsql} />} />
          <Route path="/master/mcqmaster-export" element={<LazyRoute Component={McqExport} />} />
          <Route path ="/admin/admin-rollupdate" element={<LazyRoute Component={Userollmaster} />} />
          <Route path ='/admin/navbaradd' element={<LazyRoute Component={Navbaradd} />} />
          <Route path ='/admin/rollmaster' element={<LazyRoute Component={Rollmaster} />} />
          <Route path ='/admin/examinerrollupdate' element={<LazyRoute Component={RollexaminerUpdate} />} />
          <Route path ='/chiefRemarks' element={<LazyRoute Component={ChiefRemarks} />} />
          <Route path ="/admin/examiner-attendance" element ={<LazyRoute Component={AttendanceSheet} />} />
          <Route path ='/admin/consolidated-payment-details' element={<LazyRoute Component={ConsolidatedPaymentDetails} />} />
          <Route path ='/Evaluator-camp/PrintPdf' element={<LazyRoute Component={PdfDocumentCamp} />} />
          <Route path ='/data-allowance' element={<LazyRoute Component={DatTaAllowance} />} />
        </Route>
        
      </Route>
      {/* Catch-all 404 - must be outside IPCheckWrapper to handle all unmatched routes */}
      <Route path="*" element={<LazyRoute Component={PagenotFound} />} />
    </Route>
  )
);



//app router export
const AppRouter = () => {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};

export default AppRouter;