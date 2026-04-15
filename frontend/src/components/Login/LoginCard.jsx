import React, { useState, useEffect, useRef } from 'react'
import { Card, Form, Button, Alert } from 'react-bootstrap'
import { FaShieldAlt, FaUser, FaLock, FaGraduationCap } from 'react-icons/fa'
import { IoReloadOutline } from 'react-icons/io5'
import PasswordInput from './PasswordInput'
import navbarData from '../../hooks/navbar/navbar.json'
import navbarImage from '../../assets/SVN.png'

const LoginCard = ({ onSubmit, isLoading, error }) => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [captcha, setCaptcha] = useState("");
  const [localError, setLocalError] = useState('')
  const canvasRef = useRef(null);




  const generateCaptcha = () => {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ123456789";
    let captchaCode = "";
    for (let i = 0; i < 6; i++) {
      captchaCode += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    setCaptcha(captchaCode);
  };

  const drawCaptcha = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 170;
    canvas.height = 37;

    // Create a gradient background
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    gradient.addColorStop(0, "#eeeedd");
    gradient.addColorStop(0.5, "#eeeedd");
    gradient.addColorStop(1, "#eeeedd");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#333";
    ctx.textBaseline = "middle";

    // Draw wavy distorted text
    for (let i = 0; i < captcha.length; i++) {
      const x = 30 + i * 25;
      const y = 25 + Math.sin(i * 1.5) * 5; // Wave effect
      const angle = Math.random() * 0.3 - 0.15; // Small random rotation
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.fillStyle = `hsl(${Math.random() * 360},100%, 30%)`;
      ctx.fillText(captcha[i], -20, -5);
      ctx.restore();
    }

    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.strokeStyle = `rgba(0, 0, 0, ${Math.random()})`;
      ctx.lineWidth = Math.random() * 2;
      ctx.stroke();
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    if (captcha) drawCaptcha();
  }, [captcha]);

  return (
    <Card className="login-card">
      {/* Header Section */}
      <div className="login-header">
        <div className="header-icon-wrapper">
          <FaGraduationCap className="header-icon" />
        </div>
        <h2 className="header-title">OSMS</h2>
        <p className="header-subtitle">User Login</p>
      </div>

      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {localError && <Alert variant="danger">{localError}</Alert>}

        <Form onSubmit={(e) => {
          e.preventDefault();
          setLocalError('');
          
          if (!email || !password) {
            setLocalError('Please enter email and password');
            return;
          }
          
          if (!userInput) {
            setLocalError('Please enter the captcha code');
            return;
          }
          
          if (userInput.trim().length !== 6) {
            setLocalError('Captcha must be 6 characters long');
            return;
          }
          
          if (userInput.trim().toUpperCase() !== captcha) {
            setLocalError('Captcha does not match. Please try again.');
            setUserInput('');
            generateCaptcha();
            return;
          }
          
          onSubmit({ email, password, remember });
        }}>
          {/* Email Field */}
          <Form.Group className="form-group-custom">
            <Form.Label className="label-with-icon">
              <FaUser /> User ID
            </Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Enter your email or username" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              autoComplete="email"
            />
          </Form.Group>

          {/* Password Field */}
          <Form.Group className="form-group-custom">
            <Form.Label className="label-with-icon">
              <FaLock /> Password
            </Form.Label>
            <PasswordInput value={password} onChange={setPassword} />
          </Form.Group>

          {/* Captcha Section */}
          <Form.Group className="form-group-custom">
            <Form.Label className="label-with-icon">
              <FaShieldAlt /> Security Verification
            </Form.Label>
            
            <div className="captcha-wrapper">
              <div className="captcha-input-section">
                <Form.Control
                  type="text"
                  placeholder="Enter captcha code"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                  className="captcha-input"
                />
              </div>
              
              <div className="captcha-canvas-section">
                <canvas
                  ref={canvasRef}
                  className="captcha-canvas"
                ></canvas>
              </div>
              
              <Button
                variant="outline-primary"
                className="captcha-refresh-btn"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); generateCaptcha(); setUserInput(''); }}
                title="Refresh captcha"
                type="button"
              >
                <IoReloadOutline />
              </Button>
            </div>
          </Form.Group>

          {/* Login Button */}
          <Button type="submit" className="login-btn" disabled={isLoading} aria-busy={isLoading}>
            {isLoading ? 'Signing in…' : 'Login to Dashboard →'}
          </Button>

          {/* Forgot Password */}
          <div className="forgot-password-section">
            <a href="/forgot" className="forgot-link">
              <FaLock /> Forgot Password?
            </a>
          </div>
        </Form>
      </Card.Body>
    </Card>
  )
}

export default LoginCard
