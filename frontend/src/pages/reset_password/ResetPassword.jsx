import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ResetCard from '../../components/ResetComponents/ResetCard'
import '../../style/login.css'
import { useResetPasswordMutation } from "../../redux-slice/authApiSlice"
import { toast } from 'react-toastify'


const ResetPassword = () => {

    const navigate = useNavigate()
    const { userInfo } = useSelector((state) => state.auth)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [resetPasswordMutation, { isLoading: isResetting }] = useResetPasswordMutation()

    const onSubmit = async ({ tempPassword, newPassword, confirmPassword }) => {
        setError(null)
        setIsLoading(true)
        
        try {
            const examinerEmail = userInfo?.Examiner_id
            console.log("Examiner_id:", examinerEmail, "New Password:", newPassword, "Confirm Password:", confirmPassword)
            const response = await resetPasswordMutation({ email: examinerEmail, password: newPassword, confirmPassword, passwordStatus: "0" }).unwrap();
            console.log("Password reset response:", response);

            toast.success(response.message || "Password reset successful");
            navigate('/');
        } catch (err) {
            const errorMessage = err?.data?.message || err.error || "Failed to reset password";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="reset-card-wrapper" style={{ width: '100%', maxWidth: '520px' }}>
                <ResetCard onSubmit={onSubmit} isLoading={isLoading} error={error} />
            </div>
        </div>
    )
}

export default ResetPassword
