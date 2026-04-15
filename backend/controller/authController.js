const express = require("express");
const asyncHandler = require("express-async-handler");
const db = require("../db/models");
const faculties = db.faculties;
const User_Log = db.User_Logs;
//const sub_master = db.sub_master;
const AppError = require("../utils/appError");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../utils/sendmail");
const jwt = require("jsonwebtoken");
const { generateToken, verifyToken } = require("../utils/jwtToken");
const {
  formatToIST,
  getCurrentISTDateTime,
  getClientIP,
} = require("../utils/formatDateTime");

const registerUser = asyncHandler(async (req, res) => {
  const { Dep_Name, FACULTY_NAME, Eva_Id, Role, subcode } = req.body;
  if (!Dep_Name || !FACULTY_NAME || !Eva_Id || !Role || !subcode) {
    res.status(400);
    throw new AppError("Please provide all required fields", 400);
  }
  const generatePasword = Math.random()
    .toString(36)
    .slice(-8)
    .toString()
    .toUpperCase();

  const existingUser = await faculties.findOne({
    where: { Eva_Id: req.body.Eva_Id },
  });
  if (existingUser) {
    res.status(400);
    throw new AppError("User already exists with this Eva_Id", 400);
  }

  const Dataupdeate = await faculties.create({
    Dep_Name,
    Eva_Id,
    Role,
    FACULTY_NAME,
    ResetPass: 0,
    subcode,
    Password: await bcrypt.hash(generatePasword, bcrypt.genSaltSync(10)),
    Temp_Password: generatePasword,
  });

  const { username, password } = req.body;
  res
    .status(201)
    .json({ message: "User registered successfully", user: req.body.Role });
});

const loginUser = asyncHandler(async (req, res) => {
  const clientIP = getClientIP(req);
  const { email: username, password } = req.body;

  // Trim username and password to avoid whitespace issues
  const trimmedUsername = username?.trim();
  const trimmedPassword = password?.trim();

  if (!trimmedUsername || !trimmedPassword) {
    throw new AppError("Username and password are required", 401);
  }

  const user_exists = await faculties.findOne({ where: { Eva_Id: trimmedUsername } });
  console.log("Login attempt for username:", trimmedUsername, "Password length:", trimmedPassword?.length, "User found:", !!user_exists);
  
  if (!user_exists) {
    console.log("User not found in database");
    throw new AppError("Invalid credentials", 401);
  } else {
    console.log("Stored password hash:", user_exists.Password?.substring(0, 20) + "...");
    const isPasswordValid = await bcrypt.compare(
      trimmedPassword,
      user_exists.Password
    );
    console.log("Password validation result for username:", trimmedUsername, "isValid:", isPasswordValid);
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }
  }

  if (user_exists.ResetPass == "0") {
    res.status(200).json({
      message: "Please Reset Your Pasword ",
      user_status: 0,
      id: user_exists.id,
      Examiner_id: user_exists.Eva_Id,
      Dep_Name: user_exists.Dep_Name,
      FACULTY_NAME: user_exists.FACULTY_NAME,
    });
    return;
  }

  user_exists.token_version = user_exists.token_version + 1;
  await user_exists.save();
  const token = generateToken(res, user_exists.id, user_exists.token_version);

  req.session.userid = {
    id: user_exists.id,
    user_Type: user_exists.Eva_Id,
    Candidate_Name: user_exists.FACULTY_NAME,
    Candidate_TestCode: user_exists.subcode,
    AdminStatus: user_exists.Role,
    User_Ip: clientIP,
  };
  req.session.save();

  const User_Log_Update = await User_Log.create({
    User_Name: user_exists.Eva_Id,
    User_Acticity: "Login",
    User_Ip: clientIP,
  });




  
  console.log("user_exists.Max_Paper", user_exists.Max_Paper);

  res.status(200).json({
    message: "User logged in successfully",
    user_status: 1,
    user_Success: true,
    id: user_exists.id,
    username: user_exists.Eva_Id,
    name: user_exists.FACULTY_NAME,
    department: user_exists.Dep_Name,
    role: user_exists.Role,
    subcode: user_exists.subcode,
    Eva_Subject: user_exists.Eva_Subject,
    Max_Papers_subject: user_exists.Max_Paper,
    Sub_Max_Papers: user_exists.Sub_Max_Paper,
    chief_examiner: user_exists.chief_examiner,
    Chief_subcode: user_exists.Chief_subcode,
    Chief_Eva_Subjects: user_exists.Chief_Eva_Subject,
    Camp_id: user_exists.Camp_id,
    camp_offcer_id_examiner: user_exists.camp_offcer_id_examiner,
    Camp_id_chief: user_exists.Camp_id_chief,
    camp_offcer_id_chief: user_exists.camp_offcer_id_chief,
    Examiner_Valuation_Status: user_exists.Examiner_Valuation_Status,
    Chief_Valuation_Status: user_exists.Chief_Valuation_Status,
    eva_month_year : user_exists.Eva_Mon_Year,
    Mobile_Number: user_exists.Mobile_Number,
    Email_Id: user_exists.Email_Id,
    terms: user_exists.terms,
    Dep_Name_1: user_exists.Dep_Name_1,
    Dep_Name_2: user_exists.Dep_Name_2,
    Dep_Name_3: user_exists.Dep_Name_3,
    Dep_Name_4: user_exists.Dep_Name_4,
    Dep_Name_5: user_exists.Dep_Name_5,
    Dep_Name_6: user_exists.Dep_Name_6,
    Dep_Name_7: user_exists.Dep_Name_7,
    Dep_Name_8: user_exists.Dep_Name_8,
    Dep_Name_9: user_exists.Dep_Name_9,
    Dep_Name_0: user_exists.Dep_Name_0,
    User_Roll_Admin: user_exists.User_Roll_Admin,
    
    

    
  });
});

const password_reset = asyncHandler(async (req, res, next) => {
  const { email: username, password, confirmPassword ,passwordStatus} = req.body;
  console.log(username, password, confirmPassword, passwordStatus);
  if (!username || !password || !confirmPassword) {
    return next(new AppError("Please provide email and Password", 401));
  }

  if (password !== confirmPassword) {
    return next(
      new AppError("Password and Confirm Password do not match", 401)
    );
  }

  const result = await faculties.findOne({
    where: { Eva_Id: username, ResetPass: passwordStatus},
  });
  if (!result) {
    return next(new AppError("Incorrect email or Password", 401));
  }
  if (result) {
    result.Password = bcrypt.hashSync(password, 10);
    result.ResetPass = 1;
    const result_updated = await result.save();
    res.status(200).json({
      Message: "Password Reset",
      Candidate_Name: result_updated.FACULTY_NAME,
    });
  } else {
    res.status(404);
    return next(new AppError("User not found", 404));
  }
});

const logout = asyncHandler(async (req, res) => {
  const clientIP = getClientIP(req);
  token = req.cookies.jwt;
  const TokenValue = verifyToken(token);
  console.log("User ID from session:", req.session.userid);
  const User_Log_Update = await User_Log.create({
    User_Name: req.session.userid.user_Type,
    User_Acticity: "Logout",
    //User_Ip: req.session.userid.User_Ip,
    User_Ip: clientIP,
  });
  req.session.destroy();
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.session = null;

  res.status(200).json({ message: "Logged out successfully" });
});

const passsent_email = asyncHandler(async (req, res, next) => {
  const clientIP = getClientIP(req);
  const { email } = req.body;
  if (!email) {
    return next(new AppError("Please provide email", 401));
  }
  const result = await faculties.findOne({ where: { Eva_Id: email } });
  if (!result) {
    return next(new AppError("Incorrect email", 401));
  }

  const Candidate_email = result.Email_Id;
  if (!Candidate_email) {
    return next(new AppError("Email ID not found for the user", 401));
  }
  //const password = randomPassword(8);

  const User_Log_Update = await User_Log.create({
    User_Name: Candidate_email,
    User_Acticity: "Password Reset",
    User_Ip: clientIP,
  });

  const generatePasword = Math.random()
    .toString(36)
    .slice(-8)
    .toString()
    .toUpperCase();

  result.Temp_Password = generatePasword;

  result.Password = bcrypt.hashSync(generatePasword, 10);
  result.ResetPass = "0";
  await result.save();
  const subject = "Puducherry Technical University Password Reset";
  //const body = `Your password is ${password}`;
  const emailBody = `
        <h1>Password Reset</h1>
        <p>Dear ${result.FACULTY_NAME},</p>
        <p>Your password is: ${generatePasword}</p>
  
  `;
  try {
    await sendEmail(Candidate_email, subject, emailBody);
    return res.status(200).json({
      Message: "Password sent to your email " + Candidate_email,
    });
  } catch (error) {
    return next(new AppError("Email not sent", 401));
  }
});
const acceptTerms = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) {
    throw new AppError('User id is required', 400);
  }
  const user = await faculties.findByPk(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  user.terms = 'accepted';
  await user.save();
  res.status(200).json({
    status: 'success',
    message: 'Terms accepted successfully',
    terms: 'accepted',
  });
});

module.exports = {
  registerUser,
  loginUser,
  password_reset,
  passsent_email,
  logout,
  acceptTerms,
};
