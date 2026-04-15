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
const PagenotFound = lazy(() => import("../pages/Dashboard/Pagenotfound/PagenotFound.jsx"));
const Resetpassword = lazy(() => import("../pages/Resetpassword/Resetpassword.jsx"));
const ProfileUser = lazy(() => import("../pages/profile/ProfileUser.jsx"));
const AdminWindowsql = lazy(() => import("../pages/adminwindow/AdminWindowsql.jsx"));
const Userollmaster = lazy(() => import("../pages/UserRoll/Userollmaster.jsx"));
const Navbaradd = lazy(() => import("../pages/UserRoll/Navbaradd.jsx"));
const Rollmaster = lazy(() => import("../pages/UserRoll/Rollmaster.jsx"));
const RollexaminerUpdate = lazy(() => import("../pages/UserRoll/RollexaminerUpdate.jsx"));
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
          <Route path ="/change-password" element={<LazyRoute Component={Resetpassword} />} />
          <Route path ="/profile" element={<LazyRoute Component={ProfileUser} />} />
          <Route path="/admin/admin-window" element={<LazyRoute Component={AdminWindowsql} />} />
          <Route path ="/admin/admin-rollupdate" element={<LazyRoute Component={Userollmaster} />} />
          <Route path ='/admin/navbaradd' element={<LazyRoute Component={Navbaradd} />} />
          <Route path ='/admin/rollmaster' element={<LazyRoute Component={Rollmaster} />} />
          <Route path ='/admin/examinerrollupdate' element={<LazyRoute Component={RollexaminerUpdate} />} />
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