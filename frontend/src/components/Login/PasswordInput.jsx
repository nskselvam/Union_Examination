import React, { useState, useMemo } from 'react'
import { InputGroup, Button, Form } from 'react-bootstrap'
import { FaEye,FaEyeSlash } from "react-icons/fa"

const scorePassword = (pw) => {
  if (!pw) return { score: 0, label: 'Very weak' }
  let score = 0
  if (pw.length > 7) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const labels = ['Very weak', 'Weak', 'Okay', 'Strong', 'Very strong']
  return { score, label: labels[Math.min(score, labels.length - 1)] }
}

const PasswordInput = ({ value, onChange, placeholder = 'Password', name = 'password' }) => {
  const [visible, setVisible] = useState(true)
  const { score, label } = useMemo(() => scorePassword(value), [value])

  return (
    <div className="password-input">
      <InputGroup>
        <Form.Control
          name={name}
          type={visible ? 'password' : 'text'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={placeholder}
          autoComplete="current-password"
        />
        <Button variant="outline-secondary" onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Hide password' : 'Show password'}>
          {visible ? <FaEyeSlash /> : <FaEye />}
        </Button>
      </InputGroup>

     {/*  <div className="pw-meta d-flex justify-content-between align-items-center mt-2">
        <small className="text-muted">{label}</small>
        <div className="pw-bar" aria-hidden>
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className={`pw-seg ${i < score ? 'on' : ''}`}></span>
          ))}
        </div>
      </div> */}
    </div>
  )
}

export default PasswordInput
