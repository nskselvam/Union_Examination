const jwt = require('jsonwebtoken')
  const generateToken = (res, userId,token_version) => {
    const token = jwt.sign({ userId,token_version }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    })
        // Set JWT as HTTP-Only cookie
    res.cookie('jwt', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Days
    })
    
  }
  const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET)
  }

module.exports ={generateToken,verifyToken}