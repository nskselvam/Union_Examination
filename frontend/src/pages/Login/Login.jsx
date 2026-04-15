import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import LoginCard from '../../components/Login/LoginCard'
import { useLoginMutation } from '../../redux-slice/authApiSlice'
import { loginSuccess } from "../../redux-slice/authSlice";
import '../../style/login.css'
import login from "../../hooks/login/login.json"
import { toast } from 'react-toastify'
//Login file import 



const Login = () => {

  //variable declaration
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loginMutation, { isLoading }] = useLoginMutation()
  const [error, setError] = useState(null)
  // Handle form submission
  const onSubmit = async ({ email, password, remember }) => {

    setError(null)
    try {
      const response = await loginMutation({ email, password }).unwrap();

      const userData = {
        ...response,
      }

      if (userData.user_status == 0) {
        dispatch(loginSuccess({ ...userData }));
        toast.info(userData.message || "Please reset your password");
        navigate(`/reset-password`);
      }
      else if (userData.user_status == 1 && userData.user_Success) {
        dispatch(loginSuccess({ ...userData }));
        toast.success(userData.message || "Login successful");
        navigate('/common/dashboard');
      }
      else {
        toast.error("Invalid credentials");
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error || "Login failed");
    }
  }


//return value
  return (
    <div className="login-container">
      <div className="login-content-wrapper">
        <div className="login-left-section">
          <LoginCard onSubmit={onSubmit} isLoading={isLoading} error={error} />
        </div>
        
        <div className="login-right-section">
          <div className="instructions-card">
            <h3 className="instructions-title">INSTRUCTIONS TO THE EVALUATORS</h3>
            <div className="instructions-content">
              <ul className="instructions-list">
                <li>To login - ID, and an OTP was already sent to your Registered Mobile number.</li>
                <li>You will be requested to Reset the Password.</li>
                <li>The Password should be with 8 digits, Alpha Numerical along with atleast one special character. (For Example- Exam@123).</li>
                <li>While entering Marks – Enter '0' for wrong answers and Enter 'NA' if Not Answered.</li>
                <li>Award Marks for all the attended questions irrespective of choices which will be done by the system.</li>
                <li>'Save' button will be enabled after you checked the last page of the answer booklet.</li>
                <p style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: 'red' }}>SPECIAL INSTRUCTIONS</p>
                <li>Maintain Silence in the evaluation hall.</li>
                <li>Logout properly before you leave or keeping the system idle.</li>
                <li>Do not use Mobile Phones in the evaluation hall.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


export default Login
