const express = require("express");
const asyncHandler = require("express-async-handler");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const { PDFDocument: PDFLibDocument, rgb, sum } = require('pdf-lib');
const db = require("../db/models");
const { Sequelize, Op, or } = require("sequelize");
const sub_master = db.sub_master;
const faculties = db.faculties;
const { formatToIST, formatDateOnly, getCurrentISTDateTime, numberToWords } = require("../utils/formatDateTime");
const AppError = require("../utils/appError");
const { get } = require("http");
const e = require("express");

// Function to convert number to words (Indian Rupees)



const subcode_Fetech = asyncHandler(async (req, res) => {
  const {
    department,
    subcode,
    Chief_subcode,
    chief_examiner,
    Eva_Subject,
    Examiner_Valuation_Status,
    Chief_Eva_Subjects,
    Max_Papers_subject,
    Sub_Max_Papers,
    Camp_id,
    camp_offcer_id_examiner,
    Chief_Valuation_Status,
    Camp_id_chief,
    camp_offcer_id_chief,
    Dep_Name,
    role,
    rolefinal
  } = req.body;
  console.log("subcode_Fetech body", req.body);
  const subcodeArray = subcode ? subcode.split(",") : [];
  const subcode_subjet = [];
  const chiefSubcodeArray = Chief_subcode ? Chief_subcode.split(",") : [];
  const EvaIdArray = chief_examiner ? chief_examiner.split(",") : [];
  console.log("chiefSubcodeArray", EvaIdArray);
  const chief_subcode_subject = [];
  const Dep_Name_Final = `Dep_Name_${rolefinal}`;
  console.log("Dep_Name_Final", Dep_Name_Final);


  // Fetch faculty data if chief examiners exist
  let facultyData = [];
  if (chiefSubcodeArray.length > 0 && EvaIdArray.length > 0) {
    facultyData = await faculties.findAll({
      where: { Eva_Id: { [Op.in]: EvaIdArray } },
    });
    console.log("facultyData", facultyData);
  }

  if (subcodeArray.length > 0) {
    const subjects = await sub_master.findAll({
      where: {
        Subcode: { [Op.in]: subcodeArray }, Dep_Name: Dep_Name

      },
      order: [['Subcode', 'ASC']]
    });

    subjects.forEach((subject) => {
      console.log("subject", subject.Rate_Per_Script);
      subcode_subjet.push({
        department:
          department.split(",")[subcodeArray.indexOf(subject.Subcode)] || "0",
        sub_code: subject.Subcode,
        sub_name: subject.SUBNAME,
        Eva_subject_dashboard:
          Eva_Subject.split(",")[subcodeArray.indexOf(subject.Subcode)] || "0",
        rate_per_script: subject.Rate_Per_Script || "0",
        min_amount: subject.Min_Amount || "0",
        qbs_status: subject.qb_flg || "N",
        mismatch_flg: subject.mismatch_flg || "N",
        key_status: subject.ans_flg || "N",
        exam_type: subject.Type_of_Exam || "N",
        qbskey_status: subject.Mismatch_Remarks || "N",
        Max_Papers: Max_Papers_subject || "0",
        Sub_Max_Papers:
          Sub_Max_Papers.split(",")[subcodeArray.indexOf(subject.Subcode)] ||
          "0",
        Camp_id:
          Camp_id.split(",")[subcodeArray.indexOf(subject.Subcode)] || "0",
        camp_offcer_id_examiner:
          camp_offcer_id_examiner.split(",")[
          subcodeArray.indexOf(subject.Subcode)
          ] || "0",
          Examiner_Valuation_Status: Examiner_Valuation_Status.split(",")[subcodeArray.indexOf(subject.Subcode)] || "N",
      });
    });
  }

  if (chiefSubcodeArray.length > 0) {
    const chiefSubjects = await sub_master.findAll({
      where: {
        Subcode: { [Op.in]: chiefSubcodeArray }, Dep_Name: Dep_Name

      },
    });
    chiefSubjects.forEach((subject) => {
      chief_subcode_subject.push({
        chief_sub_code: subject.Subcode,
        chief_sub_name: subject.SUBNAME,
        Chief_Eva_subject_dashboard:
          Chief_Eva_Subjects.split(",")[
          chiefSubcodeArray.indexOf(subject.Subcode)
          ] || "0",
        chief_examiner:
          chief_examiner.split(",")[
          chiefSubcodeArray.indexOf(subject.Subcode)
          ] || "0",

        chief_examiner_name:
          facultyData.find(
            (faculty) =>
              faculty.Eva_Id ==
              chief_examiner.split(",")[
              chiefSubcodeArray.indexOf(subject.Subcode)
              ]
          )?.FACULTY_NAME || "N/A",

        Chief_Valuation_Status:
          Chief_Valuation_Status.split(",")[
          chiefSubcodeArray.indexOf(subject.Subcode)
          ] || "0",
        Camp_id_chief:
          Camp_id_chief.split(",")[
          chiefSubcodeArray.indexOf(subject.Subcode)
          ] || "0",
        camp_offcer_id_chief:
          camp_offcer_id_chief.split(",")[
          chiefSubcodeArray.indexOf(subject.Subcode)
          ] || "0",
        rate_per_script: subject.Rate_Per_Script || "0",
        min_amount: subject.Min_Amount || "0",
      });
    });
  }

  console.log("subcode_subjet", chief_subcode_subject);

  res.status(200).json({
    subcode_subjects: subcode_subjet,
    chief_subcode_subjects: chief_subcode_subject,
  });
});

const dashboard_Data_Subcode = asyncHandler(async (req, res) => {
  // Example: Fetch count of users and roles
  const { department, role, subcode, Eva_Subject, Eva_Id } = req.body;

  console.log("dashboard_Data_Subcode request body", req.body);

  const EvasubjectArray = Eva_Subject ? Eva_Subject.split(",") : [];
  const subcodeArray = subcode ? subcode.split(",") : [];

  const Current_DateTime = getCurrentISTDateTime();
  console.log("Current_DateTime", Current_DateTime);

  let importDataFinal = [];
  let flname
  let subCodeExaminer;

  for (let i = 0; i < EvasubjectArray.length; i++) {
      flname = "import" + EvasubjectArray[i];
      subCodeExaminer = subcodeArray[i];
          const query1 = `
      SELECT
        subcode,
        COUNT(*) AS overall_subcode_total,
        SUM(CASE WHEN "Checked" = 'Yes' THEN 1 ELSE 0 END) AS overall_checked_total,
        SUM(CASE WHEN "Evaluator_Id" = :evaluatorId AND "Checked" = 'Yes' THEN 1 ELSE 0 END) AS overall_examiner_total,
        SUM(CASE WHEN substring("checkdate",1,10) = :today THEN 1 ELSE 0 END) AS checkdate_group_total,
        SUM(CASE WHEN "Evaluator_Id" = :evaluatorId AND "Checked" = 'Yes' AND substring("checkdate",1,10) = :today THEN 1 ELSE 0 END) AS checkdate_examiner_total,
        :evaluatorId AS "Evaluator_Id",
        :evaSubject AS "Eva_Subject"
      FROM ${flname}
      WHERE subcode IN (:subcodes)
        AND subcode IS NOT NULL
        AND TRIM(subcode) != ''
      GROUP BY subcode
      ORDER BY subcode;
    `;

    import1Data = await db.sequelize.query(query1, {
      replacements: {
        evaluatorId: Eva_Id,
        subcodes: subCodeExaminer,
        today: Current_DateTime.toString().substring(0, 10),
        evaSubject: EvasubjectArray[i],
      
      },
      type: Sequelize.QueryTypes.SELECT,
    });

    importDataFinal.push(...import1Data);

  }

  console.log("Import1 Data:", importDataFinal);
  // let subVal1 = [];
  // let subVal2 = [];
  // let subVal3 = [];
  // let subVal4 = [];

  // for (let i = 0; i < EvasubjectArray.length; i++) {
  //   switch (parseInt(EvasubjectArray[i], 10)) {
  //     case 1:
  //       subVal1.push(subcodeArray[i]);
  //       break;
  //     case 2:
  //       subVal2.push(subcodeArray[i]);
  //       break;
  //     case 3:
  //       subVal3.push(subcodeArray[i]);
  //       break;
  //     case 4:
  //       subVal4.push(subcodeArray[i]);
  //       break;
  //     default:
  //       break;
  //   }
  // }

  // let import1Data = [];
  // let import2Data = [];
  // let import3Data = [];
  // let import4Data = [];

  // // Import1 Query
  // if (subVal1.length > 0) {
  //   const query1 = `
  //     SELECT
  //       subcode,
  //       COUNT(*) AS overall_subcode_total,
  //       SUM(CASE WHEN "Checked" = 'Yes' THEN 1 ELSE 0 END) AS overall_checked_total,
  //       SUM(CASE WHEN "Evaluator_Id" = :evaluatorId AND "Checked" = 'Yes' THEN 1 ELSE 0 END) AS overall_examiner_total,
  //       SUM(CASE WHEN substring("checkdate",1,10) = :today THEN 1 ELSE 0 END) AS checkdate_group_total,
  //       SUM(CASE WHEN "Evaluator_Id" = :evaluatorId AND "Checked" = 'Yes' AND substring("checkdate",1,10) = :today THEN 1 ELSE 0 END) AS checkdate_examiner_total,
  //       :evaluatorId AS "Evaluator_Id"
  //     FROM import1
  //     WHERE subcode IN (:subcodes)
  //       AND subcode IS NOT NULL
  //       AND TRIM(subcode) != ''
  //     GROUP BY subcode
  //     ORDER BY subcode;
  //   `;

  //   import1Data = await db.sequelize.query(query1, {
  //     replacements: {
  //       evaluatorId: Eva_Id,
  //       subcodes: subVal1,
  //       today: Current_DateTime.toString().substring(0, 10),
  //     },
  //     type: Sequelize.QueryTypes.SELECT,
  //   });
  // }

  // // Import2 Query
  // if (subVal2.length > 0) {
  //   const query2 = `
  //     SELECT
  //       subcode,
  //       COUNT(*) AS overall_subcode_total,
  //       SUM(CASE WHEN "Checked" = 'Yes' THEN 1 ELSE 0 END) AS overall_checked_total,
  //       SUM(CASE WHEN "Evaluator_Id" = :evaluatorId AND "Checked" = 'Yes' THEN 1 ELSE 0 END) AS overall_examiner_total,
  //       SUM(CASE WHEN substring("checkdate",1,10) = :today THEN 1 ELSE 0 END) AS checkdate_group_total,
  //       SUM(CASE WHEN "Evaluator_Id" = :evaluatorId AND "Checked" = 'Yes' AND substring("checkdate",1,10) = :today THEN 1 ELSE 0 END) AS checkdate_examiner_total,
  //       :evaluatorId AS "Evaluator_Id"
  //     FROM import2
  //     WHERE subcode IN (:subcodes) AND Dep_Name = :department
  //       AND subcode IS NOT NULL
  //       AND TRIM(subcode) != ''
  //     GROUP BY subcode
  //     ORDER BY subcode;
  //   `;

  //   import2Data = await db.sequelize.query(query2, {
  //     replacements: {
  //       evaluatorId: Eva_Id,
  //       subcodes: subVal2,
  //       today: Current_DateTime.toString().substring(0, 10),
  //     },
  //     type: Sequelize.QueryTypes.SELECT,
  //   });
  // }

  // // Import3 Query
  // if (subVal3.length > 0) {
  //   const query3 = `
  //     SELECT
  //       subcode,
  //       COUNT(*) AS overall_subcode_total,
  //       SUM(CASE WHEN "Checked" = 'Yes' THEN 1 ELSE 0 END) AS overall_checked_total,
  //       SUM(CASE WHEN "Evaluator_Id" = :evaluatorId AND "Checked" = 'Yes' THEN 1 ELSE 0 END) AS overall_examiner_total,
  //       SUM(CASE WHEN substring("checkdate",1,10) = :today THEN 1 ELSE 0 END) AS checkdate_group_total,
  //       SUM(CASE WHEN "Evaluator_Id" = :evaluatorId AND "Checked" = 'Yes' AND substring("checkdate",1,10) = :today THEN 1 ELSE 0 END) AS checkdate_examiner_total,
  //       :evaluatorId AS "Evaluator_Id"
  //     FROM import3
  //     WHERE subcode IN (:subcodes) AND Dep_Name = :department
  //       AND subcode IS NOT NULL
  //       AND TRIM(subcode) != ''
  //     GROUP BY subcode
  //     ORDER BY subcode;
  //   `;

  //   import3Data = await db.sequelize.query(query3, {
  //     replacements: {
  //       evaluatorId: Eva_Id,
  //       subcodes: subVal3,
  //       today: Current_DateTime.toString().substring(0, 10),
  //     },
  //     type: Sequelize.QueryTypes.SELECT,
  //   });
  // }

  // // Import4 Query
  // if (subVal4.length > 0) {
  //   const query4 = `
  //     SELECT
  //       subcode,
  //       COUNT(*) AS overall_subcode_total,
  //       SUM(CASE WHEN "Checked" = 'Yes' THEN 1 ELSE 0 END) AS overall_checked_total,
  //       SUM(CASE WHEN "Evaluator_Id" = :evaluatorId AND "Checked" = 'Yes' THEN 1 ELSE 0 END) AS overall_examiner_total,
  //       SUM(CASE WHEN substring("checkdate",1,10) = :today THEN 1 ELSE 0 END) AS checkdate_group_total,
  //       SUM(CASE WHEN "Evaluator_Id" = :evaluatorId AND "Checked" = 'Yes' AND substring("checkdate",1,10) = :today THEN 1 ELSE 0 END) AS checkdate_examiner_total,
  //       :evaluatorId AS "Evaluator_Id"
  //     FROM import4
  //     WHERE subcode IN (:subcodes) AND Dep_Name = :department
  //       AND subcode IS NOT NULL
  //       AND TRIM(subcode) != ''
  //     GROUP BY subcode
  //     ORDER BY subcode;
  //   `;

  //   import4Data = await db.sequelize.query(query4, {
  //     replacements: {
  //       evaluatorId: Eva_Id,
  //       subcodes: subVal4,
  //       today: Current_DateTime.toString().substring(0, 10),
  //     },
  //     type: Sequelize.QueryTypes.SELECT,
  //   });
  // }

  // console.log("Import1 Data:", import1Data);


  // res.status(200).json({
  //   import1: import1Data,
  //   import2: import2Data,
  //   import3: import3Data,
  //   import4: import4Data,
  // });
  res.status(200).json({
    import1: importDataFinal
  });
});

const dashboard_Data_Subcode_Cheif = asyncHandler(async (req, res) => {
  const {
    department,
    role,
    Chief_subcode,
    Chief_Eva_Subjects,
    chief_examiner,
    Eva_Id,
    Chief_Valuation_Status
  } = req.query;

  console.log("dashboard_Data_Subcode_Cheif request query", Chief_Valuation_Status);
  //retun
  const EvasubjectArray = Chief_Eva_Subjects
    ? Chief_Eva_Subjects.split(",")
    : [];
  const chiefExaminerArray = chief_examiner ? chief_examiner.split(",") : [];
  const subcodeArray = Chief_subcode ? Chief_subcode.split(",") : [];
  const Chief_Valuation_Status_Array = Chief_Valuation_Status ? Chief_Valuation_Status.split(",") : [];
  let Chief_data = [];
  for (let i = 0; i < EvasubjectArray.length; i++) {
  
      Chief_data.push({
        chief_sub_code: subcodeArray[i],
        chief_eaminer : chiefExaminerArray[i],
        Chief_Valuation_Status: Chief_Valuation_Status_Array[i]
      });
  }

  console.log("dashboard_Data_Subcode_Cheif request query", Chief_data);

  const Current_DateTime = getCurrentISTDateTime();
  const FacultyDataAll = await faculties.findAll({});

  let subVal1 = [];
  let subVal2 = [];
  let subVal3 = [];
  let subVal4 = [];

  let ChiefVal1 = [];
  let ChiefVal2 = [];
  let ChiefVal3 = [];
  let ChiefVal4 = [];

  for (let i = 0; i < EvasubjectArray.length; i++) {
    switch (parseInt(EvasubjectArray[i], 10)) {
      case 1:
        subVal1.push(subcodeArray[i]);
        ChiefVal1.push(chiefExaminerArray[i]);
        break;
      case 2:
        subVal2.push(subcodeArray[i]);
        ChiefVal2.push(chiefExaminerArray[i]);
        break;
      case 3:
        subVal3.push(subcodeArray[i]);
        ChiefVal3.push(chiefExaminerArray[i]);
        break;
      case 4:
        subVal4.push(subcodeArray[i]);
        ChiefVal4.push(chiefExaminerArray[i]);
        break;
      default:
        break;
    }
  }

  let import1Data = [];
  let import2Data = [];
  let import3Data = [];
  let import4Data = [];

  if (subVal1.length > 0 && ChiefVal1.length > 0) {
    const query1 = `
      SELECT 
        subcode,
        "Evaluator_Id",
        MAX("Chief_Valuation_Evaluator_Id") as "Chief_Valuation_Evaluator_Id",
        (SELECT COUNT(*) FROM import1 i2 WHERE i2.subcode = import1.subcode) as overall_subcode_total,
        SUM(CASE WHEN "Checked" = 'Yes' THEN 1 ELSE 0 END) as overall_evaluator_checked,
        SUM(CASE WHEN "Chief_Checked" = 'Yes' AND "Chief_Valuation_Evaluator_Id" = :chiefEvaluatorId THEN 1 ELSE 0 END) as overall_chief_checked
      FROM import1
      WHERE subcode IN (:subcodes) 
        AND ("Evaluator_Id" IN (:evaluatorIds) OR "Chief_Valuation_Evaluator_Id" IN (:chiefEvaluatorIds))
      GROUP BY subcode, "Evaluator_Id"
      ORDER BY subcode, "Evaluator_Id";
    `;

    import1Data = await db.sequelize.query(query1, {
      replacements: {
        chiefEvaluatorId: Eva_Id ?? null,
        evaluatorIds: ChiefVal1,
        chiefEvaluatorIds: ChiefVal1,
        subcodes: subVal1,
      },
      type: Sequelize.QueryTypes.SELECT,
    });
  }

  console.log("CheifVal1", import1Data);

  // Map Evaluator Name from FacultyDataAll into import1Data
  import1Data = import1Data.map(item => {
    const faculty = FacultyDataAll.find(f => f.Eva_Id === item.Evaluator_Id);
    const chief_Status = Chief_data.find(c => c.chief_sub_code === item.subcode && c.chief_eaminer === item.Evaluator_Id);
    return {
      ...item,
      Evaluator_Name: faculty ? faculty.FACULTY_NAME : '',
      Evaluator_Mobile: faculty ? faculty.Mobile_Number : '',
      Evaluation_Status: 1,
      Chief_Valuation_Status: chief_Status ? chief_Status.Chief_Valuation_Status : 'N'

    };
  });

  console.log("CheifVal1 with Evaluator Name", import1Data);

  res
    .status(200)
    .json({
      data: import1Data
    });
});

const userBankDetails = asyncHandler(async (req, res) => {
  const { ifsc } = req.query;
  console.log("userBankDetails request query", req.query);
  console.log("userBankDetails Ifsc_code", ifsc);

  const bankDetails = await db.bank_details_ifsc.findOne({
    where: { IFSC: ifsc },
  });

  if (!bankDetails) {
    res.status(404);
    throw new AppError("Bank details not found for the user", 404);
  }

  res.status(200).json(bankDetails);
});

const userBankDetailsStaff = asyncHandler(async (req, res) => {
  const { Eva_id } = req.query;
  console.log("userBankDetailsStaff Eva_id", Eva_id);

  const staffbankDetails = await db.staff_bank_master.findOne({
    attributes: [
      "EMPLOYEE_NAME",
      "BANK_ACCOUNT_NUMBER",
      "BANK_NAME",
      "IFSC",
      "BRANCH",
      "NATUREOFBANK",
      "BANK_ADDRESS"
    ],
    where: { EMPLOYEE_CODE: Eva_id },
  });

  if (!staffbankDetails) {
    res.status(404);
    throw new AppError("Bank details not found for the staff", 404);
  }

  res.status(200).json(staffbankDetails);
});

const userBankDetailsUpdate = asyncHandler(async (req, res) => {
  const {
    Evaluator_Id,
    Type_Edit,
    accountHolderName,
    accountNumber,
    accountType,
    bankName,
    branchName,
    confirmAccountNumber,
    ifscCode,
    branchAddress,
  } = req.body;
  console.log("userBankDetailsUpdate request body", req.body);

  if (!Evaluator_Id || !accountHolderName || !accountNumber || !bankName || !ifscCode || !branchName || !accountType) {
    res.status(400);
    throw new AppError("All fields are required", 400);
  }

  if (Type_Edit) {
    // Update existing bank details
    const updatedDetails = await db.staff_bank_master.update(
      {
        EMPLOYEE_NAME: accountHolderName,
        BANK_ACCOUNT_NUMBER: accountNumber,
        BANK_NAME: bankName,
        IFSC: ifscCode,
        BRANCH: branchName,
        NATUREOFBANK: accountType,
        BANK_ADDRESS: branchAddress
      },
      { where: { EMPLOYEE_CODE: Evaluator_Id } }
    );

    if (updatedDetails[0] === 0) {
      res.status(404);
      throw new AppError("Bank details not found for update", 404);
    }

    res.status(200).json({
      message: "Bank details updated successfully", updatedDetails: {
        EMPLOYEE_NAME: accountHolderName,
        BANK_ACCOUNT_NUMBER: accountNumber,
        BANK_NAME: bankName,
        IFSC: ifscCode,
        BRANCH: branchName,
        NATUREOFBANK: accountType,
        BANK_ADDRESS: branchAddress
      }
    });
  } else {
    // Create new bank details
    const newBankDetails = await db.staff_bank_master.create({
      EMPLOYEE_CODE: Evaluator_Id,
      EMPLOYEE_NAME: accountHolderName,
      BANK_ACCOUNT_NUMBER: accountNumber,
      BANK_NAME: bankName,
      IFSC: ifscCode,
      BRANCH: branchName,
      NATUREOFBANK: accountType,
      BANK_ADDRESS: branchAddress
    });
    res.status(201).json({ message: "Bank details created successfully", newBankDetails });
  }
  console.log("userBankDetailsUpdate request body", req.body);
});

const evaluatorDetailsSubjectCount = asyncHandler(async (req, res) => {
  const { Eva_Id, frmdate, todate, examiner_type, Camp_Id, campOfficerId } = req.query;
  console.log("evaluatorDetailsSubjectCount request query", req.query);

  const facultiesData = await faculties.findOne({ where: { Eva_Id: Eva_Id } });

  let subjectCodes = facultiesData && facultiesData.subcode ? facultiesData.subcode.split(",") : [];
  let subjectEvalType = facultiesData && facultiesData.Examiner_Valuation_Status ? facultiesData.Examiner_Valuation_Status.split(",") : [];

  let importfinal = [];

  for (let i = 1; i <= 4; i++) {

    let importData = "import" + i;

    const query = `
      SELECT 
        subcode,
        :frmdate as from_date,
        :todate as to_date,
        COUNT(*) as total_scripts,
        SUM(CASE WHEN "Checked" = 'Yes' THEN 1 ELSE 0 END) as checked_scripts,
        MIN(TO_DATE(SUBSTRING("checkdate", 1, 10), 'DD-MM-YYYY')) as first_checked_date,
        MAX(TO_DATE(SUBSTRING("checkdate", 1, 10), 'DD-MM-YYYY')) as last_checked_date,
        (SELECT COUNT(DISTINCT TO_DATE(SUBSTRING("checkdate", 1, 10), 'DD-MM-YYYY'))
         FROM ${importData}
         WHERE "Evaluator_Id" = :evaluatorId
            AND "Camp_id" = :Camp_Id
            AND "camp_offcer_id_examiner" = :campOfficerId
            AND TO_DATE(SUBSTRING("checkdate", 1, 10), 'DD-MM-YYYY') 
               BETWEEN TO_DATE(:frmdate, 'DD-MM-YYYY') AND TO_DATE(:todate, 'DD-MM-YYYY')
        ) as overall_working_days,
        '${i}' as valuation_type
      FROM ${importData}
      WHERE "Evaluator_Id" = :evaluatorId
        AND "Camp_id" = :Camp_Id
        AND "camp_offcer_id_examiner" = :campOfficerId
        AND TO_DATE(SUBSTRING("checkdate", 1, 10), 'DD-MM-YYYY') 
            BETWEEN TO_DATE(:frmdate, 'DD-MM-YYYY') AND TO_DATE(:todate, 'DD-MM-YYYY')
      GROUP BY subcode;
    `;

    console.log("evaluatorDetailsSubjectCount query", query);
    const replacements = {
      evaluatorId: Eva_Id,
      frmdate: frmdate,
      todate: todate,
      Camp_Id: Camp_Id,
      campOfficerId: campOfficerId
    };
    const data = await db.sequelize.query(query, {
      replacements: replacements,
      type: Sequelize.QueryTypes.SELECT,
    });

    importfinal.push(...data);


  }

  let Total_Amount = 0;
  let paymentGenerated = true;
  for (const element of importfinal) {
    const subMasterDetails = await sub_master.findOne({
      where: { Subcode: element.subcode }
    });
    let subcodeIndex = subjectCodes.indexOf(element.subcode);
    let evalType = subcodeIndex !== -1 ? subjectEvalType[subcodeIndex] : 'N/A';
    if (evalType === 'N') { paymentGenerated = false; }
    element.sub_name = subMasterDetails ? subMasterDetails.SUBNAME : 'N/A';
    element.rate_per_script = subMasterDetails ? subMasterDetails.Rate_Per_Script : '0';
    element.min_amount = subMasterDetails ? subMasterDetails.Min_Amount : '0';
    element.eval_type = evalType;
    let amountCalculated = 0;
    if (subMasterDetails) {
      amountCalculated = element.checked_scripts * subMasterDetails.Rate_Per_Script;
      if (amountCalculated < subMasterDetails.Min_Amount) {
        amountCalculated = subMasterDetails.Min_Amount;
      }
    }
    console.log(subcodeIndex, 'Valuation Type:', element.subcode, 'Eval Type:', evalType, 'Checked Scripts:', element.checked_scripts, 'Rate per Script:', element.rate_per_script, 'Calculated Amount:', amountCalculated);
    evalType === 'Y' ? element.amount_calculated = amountCalculated : element.amount_calculated = 0;
    Total_Amount += parseInt(element.amount_calculated);
  }

  if (!Eva_Id) {
    res.status(400);
    throw new AppError("Eva_Id is required", 400);
  }
  console.log("evaluatorDetailsSubjectCount response", { importfinal, Total_Amount, paymentGenerated });
  res.status(200).json({ message: "Functionality to be implemented", importfinal, Total_Amount, paymentGenerated });
});

const tada_allowance = asyncHandler(async (req, res) => {
  const { depcode } = req.query;
  console.log("tada_allowance request body", req.query);

  const tadaDetails = await db.datta_allowance.findAll({
    where: { depcode: depcode },
  });

  if (!tadaDetails) {
    res.status(404);
    throw new AppError("TADA details not found for the department", 404);
  }

  res.status(200).json(tadaDetails);
});

const Examiner_Payment_Challan = asyncHandler(async (req, res) => {

  console.log("Examiner_Payment_Challan request body", req.body);

  // Accept the flat paymentRecord (from examinerPaymentDetails) + optional campusName
  const { paymentRecord } = req.body;

  console.log("Received paymentRecord:", req.body);

  if (!paymentRecord) {
    return res.status(400).json({ status: 'error', message: 'paymentRecord is required' });
  }

  const {
    Evaluation_Id,
    Evaluation_Name,
    Camp_Id,
    Camp_Officer_Id,
    Degree_Name,
    Report_I_Date,
    Examiner_Type,
    Report_E_Data,
    Subject_Amount,
    Da_Amount,
    Da_Days,
    Da_Per_Day_Amt,
    Da_Descrption,
    Additional_Amount,
    Total_Amount,
    campusName,
    ChallanNumber,
    chief_Subcode_Evaluated_Script,
    chief_Examiner_Evaluated_Script,
    subcode_Amt,
    examiner_Evaluator,
    Chief_Max_Paper_Amount,
    chief_Evaluated_Day,
    subjects = [],
  } = paymentRecord;

  console.log("Received paymentRecord:", paymentRecord);

  // Fetch camp officer details
  // console.log("Fetching Camp Officer Details for ChallanNumber:", ChallanNumber);
  const CampOfficerDetails = await db.faculties.findOne({ where: { Eva_Id: Camp_Officer_Id } });

  // Fetch evaluator bank details
  const bankDetails = await db.staff_bank_master.findOne({ where: { EMPLOYEE_CODE: Evaluation_Id } });

  // Fetch evaluator contact details
  const evaluatorDetails = await db.faculties.findOne({ where: { Eva_Id: Evaluation_Id } });

  console.log("CampOfficerDetails", CampOfficerDetails);

  try {
    let templatePath;
    if(Examiner_Type === '2') {
      templatePath = path.join(__dirname, '../uploads/templates/examiner_template.pdf');
    } else if(Examiner_Type === '1') {
      templatePath = path.join(__dirname, '../uploads/templates/chiefexaminer_template.pdf');
    }
    console.log("Template Path:", templatePath);

    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ status: 'error', message: 'PDF template not found' });
    }

    const templateBytes = fs.readFileSync(templatePath);

    let templatePdf;
    try {
      templatePdf = await PDFLibDocument.load(templateBytes, {
        ignoreEncryption: true,
        updateMetadata: false,
      });
    } catch (parseError) {
      console.error('PDF parsing error:', parseError);
      return res.status(500).json({
        status: 'PARSING_ERROR',
        message: 'Unable to parse PDF template. The file may be corrupted or incompatible.',
        error: parseError.message,
      });
    }

    const pages = templatePdf.getPages();
    const firstPage = pages[0];

    if(Examiner_Type === '1') {
      firstPage.drawText(`- CHIEF EXAMINER May - 2026`, { x: 370, y: firstPage.getHeight() - 64, size: 10,  });
    }

    // Camp officer line
    firstPage.drawText(
      `${Camp_Id || ''}-${Camp_Officer_Id || ''} ${CampOfficerDetails ? CampOfficerDetails.FACULTY_NAME : ''}`,
      { x: 143, y: firstPage.getHeight() - 91, size: 10 }
    );

    // Degree name
    firstPage.drawText(Degree_Name || '', {
      x: 331, y: firstPage.getHeight() - 79, size: 9,
    });

    // Campus name
    firstPage.drawText(campusName || '', {
      x: 473, y: firstPage.getHeight() - 89, size: 9,
    });

    // Subject rows


    let yPosition = firstPage.getHeight() - 135;
    if (Examiner_Type === '2') {
      subjects.forEach((sub) => {
        firstPage.drawText(Report_I_Date || '', { x: 30, y: yPosition, size: 7.5 });
        firstPage.drawText(Report_E_Data || '', { x: 74, y: yPosition, size: 7.5 });
        firstPage.drawText(String(sub.Subcode || ''), { x: 118, y: yPosition, size: 9 });
        firstPage.drawText(String(sub.Subname || ''), { x: 175, y: yPosition, size: 9 });
        firstPage.drawText(String(sub.No_Paper || ''), { x: 465, y: yPosition, size: 9 });
        firstPage.drawText(String(sub.Paper_Amount || ''), { x: 500, y: yPosition, size: 9 });
        firstPage.drawText(String(sub.Total || ''), { x: 535, y: yPosition, size: 9 });
        yPosition -= 15;
      });
    } else if (Examiner_Type === '1') {

      yPosition -= 5;

      firstPage.drawText(Report_I_Date || '', { x: 30, y: yPosition - 50, size: 7.5 });
      firstPage.drawText(Report_E_Data || '', { x: 74, y: yPosition - 50, size: 7.5 });

      firstPage.drawText('Evaluated by Examiners - ( 10 %)', { x: 175, y: yPosition, size: 9 });

      firstPage.drawText(String(chief_Subcode_Evaluated_Script || ''), { x: 465, y: yPosition, size: 9 });
      firstPage.drawText(String(subcode_Amt || ''), { x: 500, y: yPosition, size: 9 });
      firstPage.drawText(String(Subject_Amount || ''), { x: 535, y: yPosition, size: 9 });

      yPosition -= 25;

      Evaluation_Name,
        firstPage.drawText(`Highest Paper Evaluated (${Evaluation_Name || ''} - ${examiner_Evaluator || ''})`, { x: 175, y: yPosition, size: 9 });

      firstPage.drawText(String(chief_Examiner_Evaluated_Script || ''), { x: 465, y: yPosition, size: 9 });
      firstPage.drawText(String(subcode_Amt || ''), { x: 500, y: yPosition, size: 9 });
      firstPage.drawText(String(Chief_Max_Paper_Amount || ''), { x: 535, y: yPosition, size: 9 });
    }
    // Separator line + subject total

    if (Examiner_Type === '2') {
    firstPage.drawLine({
      start: { x: 523, y: yPosition - 50 },
      end: { x: 568, y: yPosition - 50 },
      thickness: 1,
      color: rgb(0.25, 0.25, 0.25),
    });
 
    firstPage.drawText(String(Subject_Amount || 0), { x: 535, y: yPosition - 5, size: 10 });
  }
    // DA row
    if(Examiner_Type === '2') {
    if (Da_Amount && Da_Amount != 0) {
      firstPage.drawText(
        `DA Amount : ${Da_Per_Day_Amt || 0} X ${Da_Days || 0}`,
        { x: 175, y: yPosition - 20, size: 10 }
      );
      firstPage.drawText(String(Da_Amount || 0), { x: 535, y: yPosition - 20, size: 10 });
    }
  }else if(Examiner_Type === '1') {

    if (Da_Amount && Da_Amount != 0) {
      firstPage.drawText(
        // `DA Amount : ${Da_Per_Day_Amt || 0} X ${chief_Evaluated_Day || 0}`,
        `No of Days : ${chief_Evaluated_Day || 0} X DA Per Day : ${Da_Per_Day_Amt || 0}`,
        { x: 175, y: yPosition - 30, size: 10 }
      );
      firstPage.drawText(String(Da_Amount || 0), { x: 535, y: yPosition - 30, size: 10 });
    }
  }

    // Additional amount row
    if (Additional_Amount && Additional_Amount != 0) {
      firstPage.drawText('Additional Amount', { x: 175, y: yPosition - 65, size: 10 });
      firstPage.drawText(String(Additional_Amount || 0), { x: 535, y: yPosition - 65, size: 10 });
    }

    if(Examiner_Type === '2') {
        yPosition = 678;
    } else if(Examiner_Type === '1') {
        yPosition = 745;
    }

  
    // Grand total
    firstPage.drawText(String(Total_Amount || 0), { x: 535, y: yPosition - 170, size: 10 });

    // Grand total in words
    firstPage.drawText(numberToWords(Total_Amount || 0), { x: 30, y: yPosition - 170, size: 9 });

    // Evaluator details
    firstPage.drawText(Evaluation_Id || '', { x: 205, y: yPosition - 265, size: 11 });
    firstPage.drawText(Evaluation_Name || '', { x: 205, y: yPosition - 285, size: 11 });
    firstPage.drawText(bankDetails?.BANK_ACCOUNT_NUMBER || '', { x: 205, y: yPosition - 305, size: 11 });
    firstPage.drawText(bankDetails?.BANK_NAME || '', { x: 205, y: yPosition - 325, size: 11 });
    firstPage.drawText(bankDetails?.IFSC || '', { x: 205, y: yPosition - 345, size: 11 });
    firstPage.drawText(bankDetails?.BRANCH || '', { x: 205, y: yPosition - 365, size: 11 });
    firstPage.drawText(evaluatorDetails?.Mobile_Number || '', { x: 205, y: yPosition - 385, size: 11 });
    firstPage.drawText(evaluatorDetails?.Email_Id || '', { x: 205, y: yPosition - 405, size: 11 });
    firstPage.drawText(bankDetails?.NATUREOFBANK || '', { x: 205, y: yPosition - 425, size: 11 });

    // Draw BANK_ADDRESS as multiple lines (word-wrap at ~55 chars)
    const addressText = bankDetails?.BANK_ADDRESS || '';
    const maxCharsPerLine = 55;
    const addressLines = [];
    if (addressText.length > 0) {
      const words = addressText.split(' ');
      let currentLine = '';
      for (const word of words) {
        const candidate = currentLine ? `${currentLine} ${word}` : word;
        if (candidate.length <= maxCharsPerLine) {
          currentLine = candidate;
        } else {
          if (currentLine) addressLines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) addressLines.push(currentLine);
    }
    addressLines.forEach((line, index) => {
      firstPage.drawText(line, { x: 205, y: yPosition - 445 - (index * 14), size: 11 });
    });

    const pdfBytes = await templatePdf.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=examiner_payment_challan.pdf');
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Error generating PDF:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to generate PDF',
      error: error.message,
    });
  }
});

const campus_Details = asyncHandler(async (req, res) => {

  const campus_Data = await db.campus_master.findAll({
    attributes: ['campus_Code', 'campus_Name'],
    order: [['campus_Code', 'ASC']]
  });

  if (!campus_Data) {
    res.status(404);
    throw new AppError("Campus details not found", 404);
  }

  res.status(200).json(campus_Data);

});

const adminDashboardChartData = asyncHandler(async (req, res) => {
  const { Dep_Name } = req.body;

  console.log("adminDashboardChartData request body", req.body);

  if (!Dep_Name) {
    res.status(400);
    throw new Error("Dep_Name is required");
  }

  let importTotals = [];
  let allDateWise = [];

  for (let i = 1; i <= 4; i++) {
    let importData = "import" + i;

    // Overall totals per import table
    const totalQuery = `
      SELECT 
        COUNT(*) AS total_scripts,
        SUM(CASE WHEN "Checked" = 'Yes' THEN 1 ELSE 0 END) AS checked_yes,
        SUM(CASE WHEN "Checked" != 'Yes' OR "Checked" IS NULL THEN 1 ELSE 0 END) AS checked_no,
        COUNT(DISTINCT SUBSTRING("checkdate", 1, 10)) AS checkdate_days_count,
        COUNT(DISTINCT subcode) AS total_subcodes,
        COUNT(DISTINCT CASE WHEN "Checked" = 'Yes' THEN subcode END) AS completed_subcodes,
        '${i}' AS valuation_type
      FROM ${importData}
      WHERE "Dep_Name" = :Dep_Name
        AND subcode IS NOT NULL
        AND TRIM(subcode) != '';
    `;

    const [row] = await db.sequelize.query(totalQuery, {
      replacements: { Dep_Name },
      type: db.Sequelize.QueryTypes.SELECT,
    });
    if (row) importTotals.push(row);

    // Date-wise daily totals for this import table
    const dateWiseQuery = `
      SELECT 
        SUBSTRING("checkdate", 1, 10) AS check_date,
        COUNT(*) AS total_scripts,
        SUM(CASE WHEN "Checked" = 'Yes' THEN 1 ELSE 0 END) AS checked_yes,
        SUM(CASE WHEN "Checked" != 'Yes' OR "Checked" IS NULL THEN 1 ELSE 0 END) AS checked_no,
        '${i}' AS valuation_type
      FROM ${importData}
      WHERE "Dep_Name" = :Dep_Name
        AND subcode IS NOT NULL
        AND TRIM(subcode) != ''
        AND "checkdate" IS NOT NULL
        AND TRIM("checkdate") != ''
      GROUP BY SUBSTRING("checkdate", 1, 10)
      ORDER BY SUBSTRING("checkdate", 1, 10);
    `;

    const dateRows = await db.sequelize.query(dateWiseQuery, {
      replacements: { Dep_Name },
      type: db.Sequelize.QueryTypes.SELECT,
    });
    allDateWise.push(...dateRows);
  }

  // Grand total across all import tables
  const grandTotal = importTotals.reduce((acc, row) => ({
    total_scripts: acc.total_scripts + parseInt(row.total_scripts || 0),
    checked_yes: acc.checked_yes + parseInt(row.checked_yes || 0),
    checked_no: acc.checked_no + parseInt(row.checked_no || 0),
    checkdate_days_count: acc.checkdate_days_count + parseInt(row.checkdate_days_count || 0),
    total_subcodes: acc.total_subcodes + parseInt(row.total_subcodes || 0),
    completed_subcodes: acc.completed_subcodes + parseInt(row.completed_subcodes || 0),
  }), { total_scripts: 0, checked_yes: 0, checked_no: 0, checkdate_days_count: 0, total_subcodes: 0, completed_subcodes: 0 });

  grandTotal.pending_subcodes = grandTotal.total_subcodes - grandTotal.completed_subcodes;

  res.status(200).json({
    success: true,
    Dep_Name,
    grandTotal,
    importTotals,
    dateWiseData: allDateWise
  });
});

const examinerPaymentUpdate = asyncHandler(async (req, res) => {

  const {
    data,
    subjectCountData,
    daAmount,
    taAmount,
    working_days,
    daTotal,
    daTypeText,


  } = req.body;

  console.log("examinerPaymentUpdate request body", req.body);

  // console.log("Subject Count Data:", subjectCountData);

  let fromDate = formatDateOnly(data.fromDate);
  let toDate = formatDateOnly(data.toDate);

  let ChallanNumber = `${data.campId}_${data.evaluatorId}_${fromDate}_${toDate}_${data.examinerType}`;

  const existingPayment = await db.valuation_payment_master.findOne({
    where: { ChallanNumber }
  });

  if (existingPayment) {
    res.status(400);
    throw new Error("Payment with the same Challan Number already exists");
  }
  const PaymentChallenGenerate = await db.valuation_payment_master.create({
    ChallanNumber,
    Report_I_Date: fromDate,
    Report_E_Data: toDate,
    Evaluation_Id: data.evaluatorId,
    Evaluation_Name: data.evaluatorName,
    Camp_Id: data.campId,
    Camp_Officer_Id: data.campOfficerId,
    Camp_Officer_Name: data.campOfficerName,
    Examiner_Type: data.examinerType,
    Subject_Amount: subjectCountData?.Total_Amount || 0,
    Extra_Amount: data.extraAmount,
    Chief_Day_Amount: data.chiefDayAmount,
    Chief_Max_Paper_Amount: data.chiefMaxPaperAmount,
    Total_Amount: (subjectCountData?.Total_Amount || 0) + (daTotal || 0) + (taAmount || 0),
    Additional_Amount: data.additionalAmount,
    Da_Amount: daTotal,
    Da_Days: working_days,
    Da_Per_Day_Amt: data.daAmount,
    Da_Descrption: data.daTypeText,
    Degree_Name: data.degreeName,
    campusName: data.campusName
  });

  if (!PaymentChallenGenerate) {
    res.status(500);
    throw new Error("Failed to generate payment challan");
  } else {
    //console.log("PaymentChallenGenerate created with ID:", importfinal);
    for (const element of subjectCountData.importfinal) {
      console.log("Creating valuation_payment_subject for subcode:", element.subcode);
      await db.valuation_payment_subject.create({
        Valuation_Payment_Master_Id: PaymentChallenGenerate.id,
        Subcode: element.subcode,
        Subname: element.sub_name,
        No_Paper: element.checked_scripts,
        Paper_Amount: element.rate_per_script,
        Total: element.amount_calculated,
      });
    }

  }

  // console.log("PaymentChallenGenerate", PaymentChallenGenerate.id);
  // console.log("Generated Challan Number:", ChallanNumber);

  res.status(200).json({
    message: "Payment challan generated successfully",
    ChallanNumber,
    PaymentId: PaymentChallenGenerate.id,
  });

});

const examinerPaymentDetails = asyncHandler(async (req, res) => {

  const { Eva_Id, Valuation_Type, Role } = req.query;

  const whereClause = {};

  if (parseInt(Role) === 1 || parseInt(Role) === 2) {
    whereClause.Evaluation_Id = Eva_Id;
  }else if (parseInt(Role) === 4)    {
    whereClause.Camp_Officer_Id = Eva_Id;
  } 
  if (Valuation_Type) whereClause.Examiner_Type = Valuation_Type;

  const paymentDetails = await db.valuation_payment_master.findAll({
    where: whereClause,
    include: [
      {
        model: db.valuation_payment_subject,
        as: 'subjects',
        attributes: ['Subcode', 'Subname', 'No_Paper', 'Paper_Amount', 'Total']
      }
    ],
    order: [['id', 'DESC']]
  });

  // Fetch banking details and camp officer details for each payment
  const enrichedPaymentDetails = await Promise.all(
    paymentDetails.map(async (payment) => {
      const bankDetails = await db.staff_bank_master.findOne({
        where: { EMPLOYEE_CODE: payment.Evaluation_Id },
        attributes: ['BANK_ACCOUNT_NUMBER', 'IFSC', 'BANK_NAME', 'BANK_ADDRESS']
      });

      // Fetch camp officer name if not already present
      let campOfficerName = payment.Camp_Officer_Name;
      if (!campOfficerName && payment.Camp_Officer_Id) {
        const campOfficer = await db.faculties.findOne({
          where: { Eva_Id: payment.Camp_Officer_Id },
          attributes: ['FACULTY_NAME']
        });
        campOfficerName = campOfficer?.FACULTY_NAME || null;
      }

      return {
        ...payment.toJSON(),
        BANK_ACCOUNT_NUMBER: bankDetails?.BANK_ACCOUNT_NUMBER || null,
        IFSC: bankDetails?.IFSC || null,
        BANK_NAME: bankDetails?.BANK_NAME || null,
        BANK_ADDRESS: bankDetails?.BANK_ADDRESS || null,
        Camp_Officer_Name: campOfficerName || payment.Camp_Officer_Name || null,
        Examiner_Status: parseInt(payment.ChallanNumber.slice(-1)) === 1 ? 'Chief Examiner' : 'Examiner'
      };
    })
  );

  // const  staffBankDetails = await db.staff_bank_master.findOne({});

  // console.log("examinerPaymentDetails staffBankDetails", staffBankDetails);

console.log("examinerPaymentDetails enrichedPaymentDetails", enrichedPaymentDetails);

  if (!enrichedPaymentDetails || enrichedPaymentDetails.length === 0) {
    res.status(404);
    throw new Error("Payment details not found for the evaluator");
  }

  res.status(200).json(enrichedPaymentDetails);

  // console.log("examinerPaymentDetails request query", req.body);


})

const deleteValuationPaymentMaster = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ status: 'error', message: 'Payment master ID is required' });
  }

  // Verify the record exists
  const master = await db.valuation_payment_master.findOne({ where: { id } });
  if (!master) {
    return res.status(404).json({ status: 'error', message: 'Payment record not found' });
  }

  // Delete subject rows first (child records)
  const deletedSubjects = await db.valuation_payment_subject.destroy({
    where: { Valuation_Payment_Master_Id: id },
  });

  // Delete the master record
  await db.valuation_payment_master.destroy({ where: { id } });

  return res.status(200).json({
    status: 'success',
    message: 'Payment record deleted successfully',
    deletedSubjects,
  });
});

const chiefEvaluatorDetailsSubjectCount = asyncHandler(async (req, res) => {


  const { Eva_Id, frmdate, todate, examiner_type, Camp_Id, campOfficerId } = req.query;
  console.log("evaluatorDetailsSubjectCount request query", req.query);

  const facultiesData = await faculties.findOne({ where: { Eva_Id: Eva_Id } });

  console.log("facultiesData", facultiesData);

  let subjectCodes = facultiesData && facultiesData.Chief_subcode ? facultiesData.Chief_subcode.split(",") : [];
  let examinerEva_id = facultiesData && facultiesData.chief_examiner ? facultiesData.chief_examiner.split(",") : [];
  let subjectEvalType = facultiesData && facultiesData.Chief_Valuation_Status ? facultiesData.Chief_Valuation_Status.split(",") : [];
  
  // Convert arrays into structured object
  let ChiefFacult_Details = subjectCodes.map((subcode, index) => ({
    subcode: subcode.trim(),
    examiner_id: examinerEva_id[index] ? examinerEva_id[index].trim() : null,
    eval_status: subjectEvalType[index] ? subjectEvalType[index].trim() : null
  }));

  console.log("subjectCodes", subjectCodes);
  console.log("examinerEva_id", examinerEva_id);
  console.log("subjectEvalType", subjectEvalType);
  console.log("ChiefFacult_Details (structured):", ChiefFacult_Details);

  let importfinal = [];

  for (let i = 1; i <= 4; i++) {

    let importData = "import" + i;

    const query = `
      SELECT 
        subcode,
        "Evaluator_Id",
        :frmdate as from_date,
        :todate as to_date,
        COUNT(*) as total_scripts,
        SUM(CASE WHEN "Checked" = 'Yes' THEN 1 ELSE 0 END) as checked_scripts,
        SUM(CASE WHEN "Chief_Checked" = 'Yes' AND "Chief_Valuation_Evaluator_Id" = :evaluatorId THEN 1 ELSE 0 END) as chief_checked_scripts,
        MIN(TO_DATE(SUBSTRING("checkdate", 1, 10), 'DD-MM-YYYY')) as first_checked_date,
        MAX(TO_DATE(SUBSTRING("checkdate", 1, 10), 'DD-MM-YYYY')) as last_checked_date,
        (SELECT COUNT(DISTINCT TO_DATE(SUBSTRING("checkdate", 1, 10), 'DD-MM-YYYY'))
         FROM ${importData}
         WHERE "Chief_Valuation_Evaluator_Id" = :evaluatorId
            AND "Camp_id" = :Camp_Id
            AND "camp_offcer_id_examiner" = :campOfficerId
            AND TO_DATE(SUBSTRING("checkdate", 1, 10), 'DD-MM-YYYY')
               BETWEEN TO_DATE(:frmdate, 'DD-MM-YYYY') AND TO_DATE(:todate, 'DD-MM-YYYY')
        ) as overall_working_days,
        :valuationType as valuation_type
      FROM ${importData}
      WHERE "Evaluator_Id" IN (:examinerEva_id)
        AND "Camp_id" = :Camp_Id
        AND "camp_offcer_id_examiner" = :campOfficerId
        AND subcode IN (:subcodes)
        AND subcode IS NOT NULL
        AND TRIM(subcode) != ''
        AND "checkdate" IS NOT NULL
        AND TRIM("checkdate") != ''
        AND TO_DATE(SUBSTRING("checkdate", 1, 10), 'DD-MM-YYYY')
            BETWEEN TO_DATE(:frmdate, 'DD-MM-YYYY') AND TO_DATE(:todate, 'DD-MM-YYYY')
      GROUP BY subcode, "Evaluator_Id"
      ORDER BY subcode, "Evaluator_Id";
    `;

    console.log("evaluatorDetailsSubjectCount query", query);
    const replacements = {
      evaluatorId: Eva_Id,
      frmdate: frmdate,
      todate: todate,
      Camp_Id: Camp_Id,
      campOfficerId: campOfficerId,
      examinerEva_id: examinerEva_id.length > 0 ? examinerEva_id : ['__none__'],
      subcodes: subjectCodes.length > 0 ? subjectCodes : ['__none__'],
      valuationType: String(i)
    };
    const data = await db.sequelize.query(query, {
      replacements: replacements,
      type: Sequelize.QueryTypes.SELECT,
    });

    importfinal.push(...data);


  }

  let Total_Amount = 0;
  let sumSubcodeTotal = Math.ceil(importfinal.reduce((sum, item) => item.valuation_type == '1' ? sum + parseInt(item.checked_scripts || 0) : sum, 0) * 10 / 100);
  let sumSubcodeCnt = importfinal.reduce((sum, item) => item.valuation_type == '1' ? sum + parseInt(item.checked_scripts || 0) : sum, 0);
  let sumChiefSubcodeCnt_Chief =  importfinal.reduce((sum, item) => item.valuation_type == '1' ? sum + parseInt(item.chief_checked_scripts || 0) : sum, 0);
  let MaxSubcodeCnt = importfinal.reduce((max, item) => item.valuation_type == '1' ? Math.max(max, parseInt(item.checked_scripts || 0)) : max, 0);
  let IndexSubcodeCnt = importfinal.findIndex(item => item.valuation_type == '1' && parseInt(item.checked_scripts || 0) === MaxSubcodeCnt);
  let MaxSubcodeEvaluatorId = IndexSubcodeCnt !== -1 ? importfinal[IndexSubcodeCnt].Evaluator_Id : null;
  let MaxSubcode = IndexSubcodeCnt !== -1 ? importfinal[IndexSubcodeCnt].subcode : null;
  let maxSubcodeExamierName = await db.faculties.findOne({ where: { Eva_Id: MaxSubcodeEvaluatorId } });
  let MaxSubcodeExaminerNamePrint = maxSubcodeExamierName ? maxSubcodeExamierName.FACULTY_NAME : 'N/A';
  const MaxSubcodefetch = await db.sub_master.findOne({ where: { Subcode: MaxSubcode } });
  let MaxSubcodeAmt = MaxSubcodefetch ? MaxSubcodefetch.Rate_Per_Script : 0;
  let MinsubcodeAmt = MaxSubcodefetch ? MaxSubcodefetch.Min_Amount : 0;
  let sumSubcodeDay = Math.ceil((MaxSubcodeCnt || 0) / 80);

  let sumChiefSubcodeCnt = sumChiefSubcodeCnt_Chief > sumSubcodeTotal ? sumSubcodeTotal : sumChiefSubcodeCnt_Chief;
  
  let Examiner_10_Percent = parseInt(sumChiefSubcodeCnt) * parseInt(MaxSubcodeAmt);
  let Examiner_Highest_Paper_Amount = parseInt(MaxSubcodeCnt) * parseInt(MaxSubcodeAmt);
  Total_Amount = parseInt(Examiner_10_Percent) + parseInt(Examiner_Highest_Paper_Amount);
  console.log("Total checked scripts for valuation type 1:", sumSubcodeCnt);
  console.log("Total chief checked scripts for valuation type 1:", sumChiefSubcodeCnt);
  console.log("Max checked scripts for valuation type 1:", MaxSubcodeCnt);
  console.log("Calculated sumSubcodeDay:", sumSubcodeDay);
  console.log("Evaluator with max checked scripts for valuation type 1:", MaxSubcodeEvaluatorId);
  console.log("Subcode with max checked scripts for valuation type 1:", MaxSubcode);
  console.log("Max subcode examiner name:", MaxSubcodeExaminerNamePrint);
  console.log("Max subcode amount:", MaxSubcodeAmt);
  console.log("Min subcode amount:", MinsubcodeAmt);
  let paymentGenerated = true;
  for (const element of importfinal) {
    const subMasterDetails = await sub_master.findOne({
      where: { Subcode: element.subcode }
    });
    let subcodeIndex = subjectCodes.indexOf(element.subcode);
    console.log("Processing subcode:", element.subcode, "Subcode Index in faculty record:", subcodeIndex);
    let newExaminerDetails = ChiefFacult_Details.find(detail => detail.subcode === element.subcode && detail.examiner_id === element.Evaluator_Id);
    let evalType = newExaminerDetails ? newExaminerDetails.eval_status : 'N/A';

    if (evalType === 'N') { paymentGenerated = false; }
    element.sub_name = subMasterDetails ? subMasterDetails.SUBNAME : 'N/A';
    element.rate_per_script = subMasterDetails ? subMasterDetails.Rate_Per_Script : '0';
    element.min_amount = subMasterDetails ? subMasterDetails.Min_Amount : '0';
    element.eval_type = evalType;
    let amountCalculated = 0;
    if (subMasterDetails) {
      amountCalculated = element.chief_checked_scripts * subMasterDetails.Rate_Per_Script;
      if (amountCalculated < subMasterDetails.Min_Amount) {
        amountCalculated = subMasterDetails.Min_Amount;
      }
    }
    console.log(subcodeIndex, 'Valuation Type:', element.subcode, 'Eval Type:', evalType, 'Checked Scripts:', element.checked_scripts, 'Chief Checked Scripts:', element.chief_checked_scripts, 'Rate per Script:', element.rate_per_script, 'Calculated Amount:', amountCalculated);
    evalType === 'Y' ? element.amount_calculated = amountCalculated : element.amount_calculated = 0;
    // Total_Amount += parseInt(element.amount_calculated);
  }

  if (!Eva_Id) {
    res.status(400);
    throw new AppError("Eva_Id is required", 400);
  }
  console.log("chiefEvaluatorDetailsSubjectCount response", { importfinal, Total_Amount, paymentGenerated, sumSubcodeDay, sumSubcodeCnt, sumChiefSubcodeCnt, MaxSubcodeCnt, MaxSubcodeEvaluatorId, MaxSubcode, MaxSubcodeExaminerNamePrint, MaxSubcodeAmt, MinsubcodeAmt, Examiner_10_Percent, Examiner_Highest_Paper_Amount ,sumSubcodeTotal});
  res.status(200).json({ message: "Functionality to be implemented", importfinal, Total_Amount, paymentGenerated, subcodeSummary: { sumSubcodeDay, sumSubcodeCnt, sumChiefSubcodeCnt, MaxSubcodeCnt, MaxSubcodeEvaluatorId, MaxSubcode, MaxSubcodeExaminerNamePrint, MaxSubcodeAmt, MinsubcodeAmt, Examiner_10_Percent, Examiner_Highest_Paper_Amount } });

});

const chiefEvaluatorPaymentUpdate = asyncHandler(async (req, res) => {
  const {
    data,
    subjectCountData,
    daAmount,
    taAmount,
    working_days,
    daTotal,
    daTypeText,

  } = req.body;

  console.log("chiefEvaluatorPaymentUpdate request body", subjectCountData.subcodeSummary.sumSubcodeDay);

  let fromDate = formatDateOnly(data.fromDate);
  let toDate = formatDateOnly(data.toDate);

  let ChallanNumber = `${data.campId}_${data.evaluatorId}_${fromDate}_${toDate}_${data.examinerType}`;

  const existingPayment = await db.valuation_payment_master.findOne({
    where: { ChallanNumber }
  });

  if (existingPayment) {
    res.status(400);
    throw new Error("Payment with the same Challan Number already exists");
  }
  const PaymentChallenGenerate = await db.valuation_payment_master.create({
    ChallanNumber,
    Report_I_Date: fromDate,
    Report_E_Data: toDate,
    Evaluation_Id: data.evaluatorId,
    Evaluation_Name: data.evaluatorName,
    Camp_Id: data.campId,
    Camp_Officer_Id: data.campOfficerId,
    Camp_Officer_Name: data.campOfficerName,
    Examiner_Type: data.examinerType,
    Subject_Amount: subjectCountData?.subcodeSummary?.Examiner_10_Percent || 0,
    Extra_Amount: data.extraAmount,
    Chief_Day_Amount: data.chiefDayAmount,
    Chief_Max_Paper_Amount: subjectCountData?.subcodeSummary?.Examiner_Highest_Paper_Amount || 0,
    Total_Amount: (subjectCountData?.Total_Amount || 0) + (daTotal || 0) + (taAmount || 0),
    Additional_Amount: data.additionalAmount,
    Da_Amount: daTotal,
    Da_Days: working_days,
    Da_Per_Day_Amt: data.daAmount,
    Da_Descrption: data.daTypeText,
    Degree_Name: data.degreeName,
    campusName: data.campusName,
    chief_Evaluated_Day: subjectCountData?.subcodeSummary?.sumSubcodeDay || 0,
    chief_Subcode_Evaluated_Script: subjectCountData?.subcodeSummary?.sumChiefSubcodeCnt || 0,
    chief_Examiner_Evaluated_Script: subjectCountData?.subcodeSummary?.MaxSubcodeCnt || 0,
    examiner_Subcode: subjectCountData?.subcodeSummary?.MaxSubcode || null,
    examiner_Evaluator: subjectCountData?.subcodeSummary?.MaxSubcodeEvaluatorId || null,
    subcode_Amt: subjectCountData?.subcodeSummary?.MaxSubcodeAmt || 0,
    examiner_Evaluator_Name: subjectCountData?.subcodeSummary?.MaxSubcodeExaminerNamePrint || null


  });

  if (!PaymentChallenGenerate) {
    res.status(500);
    throw new Error("Failed to generate payment challan");
  } else {
    //console.log("PaymentChallenGenerate created with ID:", importfinal);
    for (const element of subjectCountData.importfinal) {
      console.log("Creating valuation_payment_subject for subcode:", element.subcode);
      await db.valuation_payment_subject.create({
        Valuation_Payment_Master_Id: PaymentChallenGenerate.id,
        Subcode: element.subcode,
        Subname: element.sub_name,
        No_Paper: element.checked_scripts,
        Paper_Amount: element.rate_per_script,
        Total: element.amount_calculated,
      });
    }

  }

  // console.log("PaymentChallenGenerate", PaymentChallenGenerate.id);
  // console.log("Generated Challan Number:", ChallanNumber);

  res.status(200).json({
    message: "Payment challan generated successfully",
    ChallanNumber,
    PaymentId: PaymentChallenGenerate.id,
  });

});

module.exports = {
  subcode_Fetech,
  dashboard_Data_Subcode,
  dashboard_Data_Subcode_Cheif,
  userBankDetails,
  userBankDetailsStaff,
  userBankDetailsUpdate,
  evaluatorDetailsSubjectCount,
  tada_allowance,
  Examiner_Payment_Challan,
  campus_Details,
  adminDashboardChartData,
  examinerPaymentUpdate,
  examinerPaymentDetails,
  deleteValuationPaymentMaster,
  chiefEvaluatorDetailsSubjectCount,
  chiefEvaluatorPaymentUpdate
};