const express = require("express");
const asyncHandler = require("express-async-handler");
const db = require("../db/models");
const { Sequelize, Op, NOW } = require("sequelize");
const valid_sections = db.valid_sections;
const valid_question = db.valid_question;
const AppError = require("../utils/appError");
const {
  getCurrentISTDateTime,
  getClientIP,
  calculateTimeDifference,
  parseISTDateTime,
} = require("../utils/formatDateTime");
const { get } = require("http");
const { exit } = require("process");


const subcode_Fetech = asyncHandler(async (req, res) => {
  const { subcode } = req.query;
  console.log(subcode, "sucode received from the frontend");
  const subcodeData = await valid_sections.findAll({
    where: { sub_code: subcode },
    attributes: {
      include: [
        [Sequelize.literal("''"), "Mark"],
        [Sequelize.literal("''"), "barcode"],
        [Sequelize.literal("''"), "eva_id"],
        [Sequelize.literal("''"), "valuation_type"],
        [Sequelize.literal("''"), "Examiner_type"],
        [Sequelize.literal("''"), "Dep_Name"],
        [Sequelize.literal("''"), "page_no"],
        [Sequelize.literal("''"), "Qbs_Page_No"],
        // Add empty string as dummy column
      ],
    },
    order: [
      ["section", "ASC"],
      ["qstn_num", "ASC"],
      ["sub_section", "ASC"],
      ["add_sub_section", "ASC"],
    ],
  });

  if (!subcodeData || subcodeData.length === 0) {
    res.status(404);
    throw new AppError("Subject  not found", 404);
  }

  const validQuestionData = await valid_question.findAll({
    where: { SUBCODE: subcode },
    order: [
      ["SECTION", "ASC"],
      ["FROM_QST", "ASC"],
      ["SUB_SEC", "ASC"],
    ],
  });

  console.log(subcode, "validQuestionData from the backend");

  if (!validQuestionData || validQuestionData.length === 0) {
    res.status(404);
    throw new AppError("Questions not found", 404);
  }

  res
    .status(200)
    .json({ Valid_Section: subcodeData, Valid_Question: validQuestionData });
});

const valuation_Barcode_Fetch = asyncHandler(async (req, res) => {
  let BarcodeStatus = false;

  const {
    subcode,
    valuation_type,
    Eva_Id,
    Eva_Mon_Year,
    Camp_id,
    camp_offcer_id_examiner,
    Examiner_type,
    Max_Papers,
    Sub_Max_Papers,
    Dep_Name
  } = req.query;

 


  if (
    !subcode ||
    !valuation_type ||
    !Eva_Id ||
    !Eva_Mon_Year ||
    !Examiner_type ||
    !Camp_id ||
    !camp_offcer_id_examiner ||
    !Max_Papers ||
    !Sub_Max_Papers ||
    Examiner_type != 2
  ) {
    res.status(201);
    throw new AppError("Missing required query parameters", 201);
  }

  const flname = `import${valuation_type}`;
  const model = db[flname];

  // Combined query to get both total and subject-specific counts
  const countResults = await db.sequelize.query(
    `SELECT 
      COUNT(*) as total_count,
      COUNT(CASE WHEN "subcode" = :subcode THEN 1 END) as subject_count
    FROM "${flname}"
    WHERE "Evaluator_Id" = :Eva_Id
      AND "Eva_Mon_Year" = :Eva_Mon_Year
      AND "E_flg" = 'Y'
      AND "Checked" = 'Yes'
      AND SUBSTRING("checkdate", 1, 10) = :currentDate`,
    {
      replacements: {
        Eva_Id: Eva_Id,
        subcode: subcode,
        Eva_Mon_Year: Eva_Mon_Year,
        currentDate: getCurrentISTDateTime().substring(0, 10)
      },
      type: db.sequelize.QueryTypes.SELECT
    }
  );

  const barcodeCount = parseInt(countResults[0].total_count);
  const Subject_Max_BarcodeCount = parseInt(countResults[0].subject_count);

  if (barcodeCount >= parseInt(Max_Papers)) {
    res.status(201);
    throw new AppError("You have reached the maximum limit for today", 201);
  }

  if (
    parseInt(Sub_Max_Papers) > 0 &&
    Subject_Max_BarcodeCount >= parseInt(Sub_Max_Papers)
  ) {
    res.status(201);
    throw new AppError(
      "You have reached the maximum limit for this subject today",
      201
    );
  }

  let ValuationSessionTime ;
  let ValuationSession ;
  let Max_Papers_Count = (parseInt(Max_Papers)/2)- parseInt(barcodeCount);
  if (parseInt(Max_Papers_Count) <= 0) {

    console.log("Dep_Name", Dep_Name);
      const Degree_Master = await db.master_data.findOne({
        where: { D_Code: Dep_Name }
      });

   
      ValuationSession = Degree_Master ? Degree_Master.Time_Flg : null;
       ValuationSessionTime= Degree_Master ? Degree_Master.Paper_Time : null;
  }

  console.log("Max_Papers_Count", Max_Papers_Count,barcodeCount, Max_Papers,ValuationSession, ValuationSessionTime);

  if (ValuationSession == "Y") {
    const currentDateTime = getCurrentISTDateTime();
    const currentTime = currentDateTime ? currentDateTime.split(" ")[1] : null;
    console.log("Current IST DateTime:", currentDateTime);
    console.log("Current Time:", currentTime);
    console.log("Valuation Session Time:", ValuationSessionTime);
    
    // Convert time strings to minutes for proper comparison
    const timeToMinutes = (timeStr) => {
      if (!timeStr || typeof timeStr !== 'string') {
        console.log("Invalid time string:", timeStr);
        return NaN;
      }
      
      let normalizedTime = timeStr.trim().toLowerCase();
      
      // Check for am/pm
      const isPM = normalizedTime.includes('pm');
      const isAM = normalizedTime.includes('am');
      
      // Remove am/pm and trim
      normalizedTime = normalizedTime.replace(/am|pm/g, '').trim();
      
      // Replace dot with colon (e.g., "3.30" -> "3:30")
      normalizedTime = normalizedTime.replace(/\./g, ':');
      
      // Split by colon
      const parts = normalizedTime.split(':');
      if (parts.length < 2) {
        console.log("Invalid time format:", timeStr);
        return NaN;
      }
      
      let hours = parseInt(parts[0], 10);
      let minutes = parseInt(parts[1], 10);
      
      if (isNaN(hours) || isNaN(minutes)) {
        console.log("Invalid hours or minutes:", hours, minutes, "from", timeStr);
        return NaN;
      }
      
      // Convert to 24-hour format if needed
      if (isPM && hours !== 12) {
        hours += 12;
      } else if (isAM && hours === 12) {
        hours = 0;
      }
      
      const totalMinutes = hours * 60 + minutes;
      console.log(`Converted "${timeStr}" to ${hours}:${minutes} (${totalMinutes} minutes)`);
      return totalMinutes;
    };
    
    const currentMinutes = timeToMinutes(currentTime);
    const sessionMinutes = timeToMinutes(ValuationSessionTime);
    
    console.log("Current Time in minutes:", currentMinutes);
    console.log("Valuation Session Time in minutes:", sessionMinutes);
    
    if (
      !isNaN(currentMinutes) && 
      !isNaN(sessionMinutes) &&
      currentMinutes <= sessionMinutes &&
      barcodeCount <= Math.round(parseInt(Max_Papers) / 2)
    ) {
      res.status(201);
      throw new AppError(
        "You are not allowed to take more papers in this session",
        201
      );
    }
  }

  console.log(
    req.query,
    "req.query received from the frontend for barcode fetch"
  );

  console.log(flname);
  const barcodeData = await model.findOne({
    where: {
      Eva_Mon_Year: Eva_Mon_Year,
      [Op.or]: [
        {
          [Op.and]: [
            { Evaluator_Id: Eva_Id },
            { subcode: subcode },
            { E_flg: "A" },
            { Checked: "NO" },
          ],
        },
        {
          [Op.and]: [{ subcode: subcode }, { E_flg: "N" }, { Checked: "NO" }],
        },
      ],
    },
    order: [
      Sequelize.literal(
        `CASE WHEN "Evaluator_Id" = '${Eva_Id}' THEN 0 ELSE 1 END`
      ),
      Sequelize.literal("RANDOM()"),
    ],
  });

  if (!barcodeData) {
    res.status(404);
    throw new AppError("Barcode not found", 404);
  } else {
    BarcodeStatus = true;
    barcodeData.E_flg = "A";
    barcodeData.Evaluator_Id = Eva_Id;
    barcodeData.A_date = getCurrentISTDateTime();
    barcodeData.Camp_id = Camp_id;
    barcodeData.camp_offcer_id_examiner = camp_offcer_id_examiner;
    await barcodeData.save();
  }
  res.status(200).json({
    data: barcodeData,
    BarcodeStatus: BarcodeStatus,
  });
  //   const { subcode } = req.query;
  //   const subcodeData = await valid_sections.findAll({
  //     where: { sub_code: subcode },
  //   });
  //   if (!subcodeData || subcodeData.length === 0) {
  //     res.status(404);
  //     throw new AppError("Subject  not found", 404);
  //   }
  //   res.status(200).json({ data: subcodeData });
});

const valuation_Image_Fetch = asyncHandler(async (req, res) => {
  const { batchname, subcode, Dep_Name, Eva_Mon_Year, Img_Number } = req.query;

  const fs = require("fs");
  const path = require("path");
  const imageDir = path.join(
    __dirname,
    "..",
    "uploads",
    Eva_Mon_Year,
    "ImgImp",
    Dep_Name,
    batchname
  );

  console.log(imageDir, "image directory path");
  //82183094_01_TE24101T
  let Img_flname =
    batchname + "_" + (parseInt(Img_Number)).toString().padStart(2, "0") + "_" + subcode;
  const imagePath = path.join(imageDir, `${Img_flname}.jpg`);

  console.log(Img_flname, "full image path");
  if (fs.existsSync(imagePath)) {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString("base64");
    res.status(200).json({ image: base64Image });
  } else {
    res.status(404);
    throw new AppError("Image not found", 404);
  }
});

const valuation_Data_Update = asyncHandler(async (req, res) => {
  const {
    barcode,
    subcode,
    Eva_Id,
    sec_id,
    page_no,
    Qbs_Page_No,
    Dep_Name,
    Marks_Get,
    section,
    sub_section,
    add_sub_section,
    max_marks,
    checkdate,
    qbno,
    Eva_Mon_Year,
    valuation_type,
    Examiner_type,
    BL_Point,
    CO_Point,
    PO_Point,
  } = req.body;

  flname = `val_data_${Dep_Name}`;

  console.log(valuation_type, "request body received for valuation data update");

  console.log(req.body, "request body received for valuation data update");


  const val_data = await db[flname].findOne({
    where: {
      barcode: barcode,
      subcode: subcode,
      sec_id: sec_id,
      eva_id: Eva_Id,
      section: section,
      qbno: qbno,
      //  sub_section: sub_section || null,
      valuation_type: valuation_type,
      Examiner_type: Examiner_type,
      Dep_Name: Dep_Name,
    },
  });




  if (!val_data) {
    await db[flname].create({
      barcode: barcode,
      subcode: subcode,
      sec_id: sec_id,
      eva_id: Eva_Id,
      page_no: page_no,
      Qbs_Page_No: Qbs_Page_No,
      section: section,
      sub_section: sub_section,
      add_sub_section: add_sub_section,
      max_marks: max_marks,
      Marks_Get: Marks_Get,
      checkdate: getCurrentISTDateTime(),
      qbno: qbno,
      valuation_type: valuation_type,
      Examiner_type: Examiner_type,
      Dep_Name: Dep_Name,
      Eva_Mon_Year: Eva_Mon_Year,
      BL_Point: BL_Point,
      CO_Point: CO_Point,
      PO_Point: PO_Point,
    });
  } else {
    val_data.Marks_Get = Marks_Get;
    val_data.page_no = page_no;
    val_data.Qbs_Page_No = Qbs_Page_No;
    val_data.section = section;
    val_data.sub_section = sub_section;
    val_data.add_sub_section = add_sub_section;
    val_data.max_marks = max_marks;
    val_data.checkdate = getCurrentISTDateTime();
    val_data.qbno = qbno;
    await val_data.save();
  }

  res.status(200).json({ message: "Data received successfully", flname });
});

const valuation_Finalize = asyncHandler(async (req, res) => {
  const {
    barcode,
    subcode,
    Eva_Id,
    Dep_Name,
    valuation_type,
    Eva_Mon_Year,
    Examiner_type,
    Final_Marks_Front,
    Regular_Questions,
    AB_Questions,
    Chief_Eva_Id,
    Total_Rounded_Marks_Front,
    Evaluator_Id
  } = req.body;

  console.log(req.body, "new req body data")



  let validSectionError = [];

  const valid_Data = await db.valid_question.findAll({
    where: {
      SUBCODE: subcode,
    },
    order: [['SECTION', 'ASC'], ['FROM_QST', 'ASC']],
    raw: true,
  });

  let flname_corscheck = `val_data_${Dep_Name}`;
  let section_Data_valuation;

  for (const validItem of valid_Data) {

    section_Data_valuation = await db[flname_corscheck].findAll({
      where: {
        subcode: validItem.SUBCODE,
        section: validItem.SECTION,
        barcode: barcode,
        eva_id: Eva_Id,
        valuation_type: valuation_type,
        Examiner_type: Examiner_type,
        Dep_Name: Dep_Name,
        qbno: {
          [Op.between]: [validItem.FROM_QST, validItem.TO_QST],
        },
      },
      order: [['section', 'ASC'], ['qbno', 'ASC']],
      raw: true,
    });

    if (!section_Data_valuation || section_Data_valuation.length === 0) {
      throw new AppError(`No valuation data found for Subcode ${validItem.SUBCODE} in section ${validItem.SECTION}.`, 404);
    } else {
      if (validItem.SUB_SEC.toUpperCase() == 'AB') {
        for (let i = validItem.FROM_QST; i <= validItem.TO_QST; i++) {
          const find_section_data = section_Data_valuation.find(section => section.qbno === i);
          if (!find_section_data) {
            throw new AppError(`No valuation data found for question ${i} in section ${validItem.SECTION} for Subcode ${validItem.SUBCODE} with sub sections AB.`, 404);
          }
        }
      } else {
        for (let i = validItem.FROM_QST; i <= validItem.TO_QST; i++) {
          console.log(`Checking question ${i} in section ${validItem.SECTION} for subcode ${validItem.SUBCODE}`);
          const find_section_data = section_Data_valuation.find(section => section.qbno === i);
          if (!find_section_data) {
            throw new AppError(`No valuation data found for question ${i} in section ${validItem.SECTION} for Subcode ${validItem.SUBCODE}.`, 404);
          }
        }
      }
    }
  }

  //   if (section_Data_valuation.length === 0) {
  //     console.log(`No valid sections found for Subcode ${validItem.SUBCODE}.`);
  //     // res.status(201).json({
  //     //   Error_Remarks: `No valid sections found for Subcode ${validItem.SUBCODE}`
  //     // });
  //     // return;
  //   } else {
  //     if (validItem.SUB_SEC.toUpperCase() == 'AB') {
  //       for (let i = validItem.FROM_QST; i <= validItem.TO_QST; i++) {
  //         for (let ii = 97; ii <= 98; ii++) {
  //           const find_section_data = section_Data_valuation.filter(
  //             (section) =>
  //               section.subcode === validItem.SUBCODE &&
  //               section.section === validItem.SECTION &&
  //               section.qbno === i &&
  //               section.sub_section === String.fromCharCode(ii)
  //           );
  //           //const sum_value = find_section_data.reduce((sum, section) => sum + (parseFloat(section.max_mark) || 0), 0);
  //           const  find_data = find_section_data.find(section => section.Marks_Get == null || section.Marks_Get == '');
  //           if (find_data || find_data == undefined) {
  //             console.log(`Max mark for question ${i}${String.fromCharCode(ii)} is missing or invalid.`);

  //           //  res.status(201).json({
  //           //     Error_Remarks: `Max mark for question ${i}${String.fromCharCode(ii)}: ${sum_value} does NOT match expected MARK_MAX: ${validItem.MARK_MAX}`
  //           //   });
  // //            return;
  //           }
  //         }
  //       }

  //     } else {
  //       for (let i = validItem.FROM_QST; i <= validItem.TO_QST; i++) {
  //         console.log(`Checking question ${i} in section ${validItem.SECTION} for subcode ${validItem.SUBCODE}`);
  //         const find_section_data = section_Data_valuation.filter(
  //           (section) =>
  //             section.subcode === validItem.SUBCODE &&
  //             section.section === validItem.SECTION &&
  //             section.qbno === i
  //         );
  //         console.log(find_section_data, `find_section_data for question ${i}`);
  //         const  find_data = find_section_data.find(section => section.Marks_Get == null || section.Marks_Get == '');
  //         if (find_data || find_data == undefined) {
  //           console.log(`Max mark for question ${i} is missing or invalid.`);
  //           // res.status(201).json({
  //           //   Error_Remarks: `Max mark for question ${i}: ${sum_value} does NOT match expected MARK_MAX: ${validItem.MARK_MAX}`
  //           // });
  //   //        return;
  //         }
  //       }
  //     }
  //   }

  // return res.status(200).json({
  //   message: "Finalization successful",
  // });





  const ClintIP = getClientIP(req);
  const flname = `val_data_${Dep_Name}`;

  const model = db[flname];
  const val_data = await model.update(
    { valid_qbs: "N" },
    {
      where: {
        barcode: barcode,
        subcode: subcode,
        eva_id: Eva_Id,
        Eva_Mon_Year: Eva_Mon_Year,
        valuation_type: valuation_type,
        Dep_Name: Dep_Name,
        Examiner_type: Examiner_type,
      },
    }
  );

  //Valid_Question_Bank fetch
  const valid_Question = await db.valid_question.findAll({
    where: { SUBCODE: subcode },
    order: [
      ["SECTION", "ASC"],
      ["FROM_QST", "ASC"],
    ],
  });

  //Mark for finalization fetch
  const val_data_section = await model.findAll({
    where: {
      barcode: barcode,
      subcode: subcode,
      eva_id: Eva_Id,
      Eva_Mon_Year: Eva_Mon_Year,
      valuation_type: valuation_type,
      Dep_Name: Dep_Name,
      Examiner_type: Examiner_type,
    },
    order: [
      ["qbno", "ASC"],
      ["section", "ASC"],
      ["sub_section", "ASC"],
      ["add_sub_section", "ASC"],
    ],
  });



  // Create sections object to hold marks for each section
  const sections = {};
  let sectionKey;
  let sectionKey1;

  for (const question of valid_Question) {
    const matchingMarks = val_data_section.filter(
      (mark) =>
        mark.section === question.SECTION &&
        parseInt(question.FROM_QST) <= parseInt(mark.qbno) &&
        parseInt(mark.qbno) <= parseInt(question.TO_QST)
    );
    if (question.SUB_SEC === "ab") {
      sectionKey = `Section${question.SECTION}a`;
      if (!sections[sectionKey]) {
        sections[sectionKey] = [];
      }

      sectionKey1 = `Section${question.SECTION}b`;
      if (!sections[sectionKey1]) {
        sections[sectionKey1] = [];
      }
    } else {
      sectionKey = `Section${question.SECTION}`;
      if (!sections[sectionKey]) {
        sections[sectionKey] = [];
      }
    }

    // Process matching marks for the current question

    let existingMark;

    matchingMarks.forEach((mark) => {
      if (question.SUB_SEC != "ab") {
        existingMark = sections[sectionKey].find((m) => m.qbno === mark.qbno);
        const markValue =
          mark.Marks_Get == "NA" ? 0 : parseFloat(mark.Marks_Get);
        const markValueForDecimal = mark.Marks_Get == "NA" ? -0.001 : parseFloat(mark.Marks_Get);
        if (existingMark) {
          existingMark.marks += markValue;
          existingMark.dummy_marks += markValue;
          existingMark.decimal_marks += markValueForDecimal;
        } else {
          sections[sectionKey].push({
            qbno: mark.qbno,
            marks: markValue,
            dummy_marks: markValue,
            decimal_marks: markValueForDecimal,
            Qst_Valid: "N",
          });
        }
      } else {
        // For 'ab' sections, implement three-tier mark tracking
        const markValue =
          mark.Marks_Get == "NA" ? 0 : parseFloat(mark.Marks_Get);
        const markValueForDecimal =
          mark.Marks_Get == "NA" ? -0.001 : parseFloat(mark.Marks_Get);
        const markCheckValue =
          mark.Marks_Get == "NA" ? 0 : parseFloat(mark.Marks_Get);
        if (mark.sub_section === "a") {
          existingMark = sections[sectionKey].find((m) => m.qbno === mark.qbno);
          if (existingMark) {
            existingMark.marks += markValue;
            existingMark.dummy_marks += markValue;
            existingMark.decimal_marks += markValueForDecimal;
            existingMark.check_marks += markCheckValue;
          } else {
            sections[sectionKey].push({
              qbno: mark.qbno,
              marks: markValue,
              dummy_marks: markValue,
              decimal_marks: markValueForDecimal,
              check_marks: markCheckValue,
              Qst_Valid: "N",
            });
          }
        } else if (mark.sub_section === "b") {
          existingMark = sections[sectionKey1].find(
            (m) => m.qbno === mark.qbno
          );
          if (existingMark) {
            existingMark.marks += markValue;
            existingMark.dummy_marks += markValue;
            existingMark.decimal_marks += markValueForDecimal;
            existingMark.check_marks += markCheckValue;
          } else {
            sections[sectionKey1].push({
              qbno: mark.qbno,
              marks: markValue,
              dummy_marks: markValue,
              decimal_marks: markValueForDecimal,
              check_marks: markCheckValue,
              Qst_Valid: "N",
            });
          }
        }
      }
    });
  }

  // Store all Object keys

  console.log("Sections with marks before finalization:", sections);
  const allSectionKeys = Object.keys(sections);
  // return

  // Compulsory Questions Handling C_QST
  // Remove unused C_QST_List code block
  let C_QST_List = [];
  valid_Question.forEach((question) => {
    if (question.C_QST) {
      C_QST_List = question.C_QST.split(",");
      let newSection = "Section" + question.SECTION;
      for (let i = 0; i < C_QST_List.length; i++) {
        C_QST_List[i] = C_QST_List[i].trim();
        sections[newSection].forEach((item) => {
          if (C_QST_List.includes(item.qbno.toString())) {
            item.dummy_marks = 99;
          }
        });
      }
    }
  });

  // Sort each section based on dummy_marks in descending order
  // allSectionKeys.forEach((key) => {
  //   sections[key] = sections[key].sort(
  //     (a, b) => parseFloat(b.dummy_marks) - parseFloat(a.dummy_marks)
  //   );
  // });

  allSectionKeys.forEach((key) => {
    sections[key] = sections[key].sort(
      (a, b) => parseFloat(b.decimal_marks) - parseFloat(a.decimal_marks)
    );
  });

  // Element Selection Based on Valid Questions

  let Final_Qst = { Sections: [] };
  let Final_Marks = 0;
  let Section_Qst = { Sectionsab: [] };
  valid_Question.forEach((question) => {
    if (question.SUB_SEC == "ab") {
      const foundItemA = sections[`Section${question.SECTION}a`];
      const foundItemB = sections[`Section${question.SECTION}b`];
      if (foundItemA && foundItemB) {
        const fromQst = parseInt(question.FROM_QST);
        const toQst = parseInt(question.TO_QST);

        // Loop through each question number in the range
        for (let qNum = fromQst; qNum <= toQst; qNum++) {
          const itemA = foundItemA.find((item) => item.qbno === qNum);
          const itemB = foundItemB.find((item) => item.qbno === qNum);

          // If both items exist, compare them
          if (itemA && itemB) {
            // Check if both marks are 0 and both check_marks are 0
            if (
              itemA.marks === 0 &&
              itemB.marks === 0 &&
              itemA.check_marks === 0 &&
              itemB.check_marks === 0
            ) {
              // Use decimal comparison - if A's decimal is less than B's, choose B
              if (itemA.decimal_marks < itemB.decimal_marks) {
                Section_Qst["Sectionsab"].push({
                  qbno: itemB.qbno,
                  sub_subction: "b",
                });
                Final_Marks += itemB.marks;
                itemB.Qst_Valid = "Y";
              } else {
                // Otherwise choose A
                Section_Qst["Sectionsab"].push({
                  qbno: itemA.qbno,
                  sub_subction: "a",
                });
                itemA.Qst_Valid = "Y";
                Final_Marks += itemA.marks;
              }
            } else if (itemA.marks >= itemB.marks && itemA.check_marks >= 0) {
              // A has higher or equal marks and check_marks is non-negative
              Section_Qst["Sectionsab"].push({
                qbno: itemA.qbno,
                sub_subction: "a",
              });
              itemA.Qst_Valid = "Y";
              Final_Marks += itemA.marks;
            } else if (itemB.check_marks >= 0) {
              // B has higher marks or A's check_marks is negative
              Section_Qst["Sectionsab"].push({
                qbno: itemB.qbno,
                sub_subction: "b",
              });
              Final_Marks += itemB.marks;
              itemB.Qst_Valid = "Y";
            }
          } else if (itemA && itemA.check_marks >= 0) {
            // Only A exists and check_marks is valid
            Section_Qst["Sectionsab"].push({
              qbno: itemA.qbno,
              sub_subction: "a",
            });
            itemA.Qst_Valid = "Y";
            Final_Marks += itemA.marks;
          } else if (itemB && itemB.check_marks >= 0) {
            // Only B exists and check_marks is valid
            Section_Qst["Sectionsab"].push({
              qbno: itemB.qbno,
              sub_subction: "b",
            });
            Final_Marks += itemB.marks;
            itemB.Qst_Valid = "Y";
          }
        }
      }
    } else {
      const foundItem = sections[`Section${question.SECTION}`];
      if (foundItem) {
        const numQuestions = parseInt(question.NOQST);
        const compulsoryQst = question.C_QST ? parseInt(question.C_QST) : null;
        const from = Number(question.FROM_QST || 0);
        const to = Number(question.TO_QST || 0);

        // Filter items to only those in the current question range (FROM_QST to TO_QST)
        const itemsInRange = foundItem.filter(item => {
          const qbn = parseInt(item.qbno);
          return qbn >= from && qbn <= to;
        });

        // Track which questions have been selected
        const selectedQuestions = [];

        // First, if there's a compulsory question, always include it
        if (compulsoryQst !== null) {
          const compulsoryItem = itemsInRange.find(item => item.qbno === compulsoryQst);
          if (compulsoryItem) {
            selectedQuestions.push(compulsoryItem);
            Final_Qst['Sections'].push({
              qbno: compulsoryItem.qbno,
              isCompulsory: true
            });
            Final_Marks += compulsoryItem.marks;
            compulsoryItem.Qst_Valid = 'Y';
          }
        }

        // Then, select the remaining questions based on highest marks from this range only
        // Exclude already selected compulsory questions
        const remainingItems = itemsInRange.filter(item =>
          !selectedQuestions.some(selected => selected.qbno === item.qbno)
        );

        const questionsToSelect = numQuestions - selectedQuestions.length;
        for (let i = 0; i < Math.min(questionsToSelect, remainingItems.length); i++) {
          Final_Qst['Sections'].push({
            qbno: remainingItems[i].qbno,
          });
          Final_Marks += remainingItems[i].marks;
          remainingItems[i].Qst_Valid = 'Y';
        }
      }
    }
  });

  allSectionKeys.forEach((key) => {
    console.log(`Updated ${key}:`, sections[key]);
  });

  // Update valid_qbs='Y' for regular sections

  const valid_data_tbl = `val_data_${Dep_Name}`;
  const model_valid_data = db[valid_data_tbl];
  if (Final_Qst.Sections && Final_Qst.Sections.length > 0) {
    const qbnoArray = Final_Qst.Sections.map((item) => item.qbno);

    await model_valid_data.update(
      { valid_qbs: "Y" },
      {
        where: {
          barcode: barcode,
          subcode: subcode,
          eva_id: Eva_Id,
          Eva_Mon_Year: Eva_Mon_Year,
          valuation_type: valuation_type,
          Examiner_type: Examiner_type,
          Dep_Name: Dep_Name,
          qbno: { [Op.in]: qbnoArray },
          Marks_Get: { [Op.ne]: "NA" },
        },
      }
    );
  }

  if (Section_Qst.Sectionsab && Section_Qst.Sectionsab.length > 0) {
    for (const item of Section_Qst.Sectionsab) {
      await model_valid_data.update(
        { valid_qbs: "Y" },
        {
          where: {
            barcode: barcode,
            subcode: subcode,
            eva_id: Eva_Id,
            Eva_Mon_Year: Eva_Mon_Year,
            valuation_type: valuation_type,
            Examiner_type: Examiner_type,
            Dep_Name: Dep_Name,
            qbno: item.qbno,
            sub_section: item.sub_subction,
            Marks_Get: { [Op.ne]: "NA" },
          },
        }
      );
    }
  }

  console.log("Final Marks Calculated:", Final_Marks);
  console.log("Total Rounded Marks:", Total_Rounded_Marks_Front);

  let totalRoundedMarks = Math.round(Final_Marks);
  if (Total_Rounded_Marks_Front != totalRoundedMarks) {
    res.status(201).json({
      message: "Finalization marks mismatch",
      Final_Marks: Final_Marks,
      Mark_Error: true,
      Regular_Questions: Final_Qst.Sections.length,
      AB_Questions: Section_Qst.Sectionsab.length,
      Total_Rounded_Marks: totalRoundedMarks,
      Total_Mark_Calculated_Front: Total_Rounded_Marks_Front,
    });
    return;
  }

  const flname_import = `import${valuation_type}`;
  const model_import = db[flname_import];
  let import_record;
  if (Examiner_type == 2) {
    import_record = await model_import.update(
      {
        Checked: "Yes",
        E_flg: "Y",
        total: Final_Marks,
        tot_round: totalRoundedMarks,
        checkdate: getCurrentISTDateTime(),
        ip: ClintIP,
      },
      {
        where: {
          barcode: barcode,
          subcode: subcode,
          Eva_Mon_Year: Eva_Mon_Year,
          Evaluator_Id: Eva_Id,
          Dep_Name: Dep_Name,
        },
      }
    );
  } else if (Examiner_type == 7 || Examiner_type == 1) {
    import_record = await model_import.update(
      {
        Chief_Checked: "Yes",
        Chief_E_flg: "Y",
        Chief_total: Final_Marks,
        Chief_tot_round: totalRoundedMarks,
        Chief_checkdate_Valuation: getCurrentISTDateTime(),
        Chief_ip: ClintIP,
      },
      {
        where: {
          barcode: barcode,
          subcode: subcode,
          Eva_Mon_Year: Eva_Mon_Year,
          Evaluator_Id: Evaluator_Id,
          Dep_Name: Dep_Name,
        },
      }
    );
  }

  console.log(import_record);
  if (!import_record) {
    // res.status(201);
    throw new AppError("Finalization failed during import update", 404);
  }

  res.status(200).json({
    message: "Finalization successful",
    Final_Marks: Final_Marks,
    Regular_Questions: Final_Qst.Sections.length,
    AB_Questions: Section_Qst.Sectionsab.length,
    Total_Rounded_Marks: totalRoundedMarks,
    Mark_Error: false,
    Total_Mark_Calculated_Front: Total_Rounded_Marks_Front,
  });
});

const examminer_valuation_data_get = asyncHandler(async (req, res) => {
  const { subcode, Eva_Id, valuation_type, barcode, Dep_Name, Examiner_type, evid_ce } = req.body;

  console.log(barcode, "req body for examiner valuation data get");
  flname = `val_data_${Dep_Name}`;
  //return

  // Build query conditions based on Examiner_type
  const whereConditions = {
    subcode: subcode,
    valuation_type: valuation_type,
    barcode: barcode,
  };

  // Add Examiner_type to query only if it's provided
  if (Examiner_type) {
    whereConditions.Examiner_type = Examiner_type;
  }

  // For Examiner_type = 2 (chief examiner), query by evid_ce (chief examiner ID)
  // For Examiner_type = 1 or undefined (original examiner), query by eva_id
  if (Examiner_type === "2" && evid_ce) {
    whereConditions.evid_ce = evid_ce;
  } else {
    whereConditions.eva_id = Eva_Id;
  }

  const examminer_valuation_data = await db[flname].findAll({
    where: whereConditions,
    order: [
      ["section", "ASC"],
      ["sub_section", "ASC"],
      ["add_sub_section", "ASC"],
    ],
  });


  if (!examminer_valuation_data || examminer_valuation_data.length === 0) {
    return res.status(200).json({ data: [] });
  }

  res.status(200).json({ data: examminer_valuation_data });
});

const examiner_review_data_get = asyncHandler(async (req, res) => {
  const {
    subcode,
    Eva_Id,
    Dep_Name,
    Eva_Mon_Year,
    valuation_type,
    Examiner_type,
  } = req.query;

  console.log(Eva_Id, "Eva_Id in examiner review data get");
  const flname_import = `import${valuation_type}`;
  const model_import = db[flname_import];
  let import_record = await model_import.findAll({
    where: {
      subcode: subcode,
      Eva_Mon_Year: Eva_Mon_Year,
      Evaluator_Id: Eva_Id,
      Dep_Name: Dep_Name,
      Checked: "Yes",
    },
    order: [
      ["checkdate", "DESC"],
      ["subcode", "ASC"],
      ["barcode", "ASC"],
    ],
  });
  res.status(200).json({
    message: "Import record fetched successfully",
    data: import_record,
  });
});

const examiner_review_value_data_get = asyncHandler(async (req, res) => {
  const {
    subcode,
    barcode,
    Dep_Name,
    Eva_Id,
    Eva_Mon_Year,
    valuation_type,
    Examiner_type,
  } = req.query;


  console.log(req.query, "Eva_Id in examiner review value data get");


  const flname = `val_data_${Dep_Name}`;



  const model = db[flname];


  let valuation_data = await model.findAll({
    where: {
      barcode: barcode,
      subcode: subcode,
      eva_id: Eva_Id,
      Eva_Mon_Year: Eva_Mon_Year,
      valuation_type: valuation_type,
      Examiner_type: Examiner_type,
    },
    order: [
      ["qbno", "ASC"],
      ["section", "ASC"],
      ["sub_section", "ASC"],
      ["add_sub_section", "ASC"],
    ],
  });


  console.log(valuation_data, "valuation data fetched for examiner review value data get");


  res.status(200).json({
    message: "Examiner review value data fetched successfully",
    data: valuation_data,
  });
});

// Cheif Valuation Barcode Fetch
const chief_valuation_Barcode_Fetch = asyncHandler(async (req, res) => {
  const {
    subcode,
    camp_id,
    camp_office_id,
    Examiner_type,
    valuation_type,
    Eva_Id,
    Eva_Mon_Year,
    RevieWFlag,
    chiefValuationtype,
    Evaluator_Id
  } = req.query;

  console.log(chiefValuationtype, "Eva_Id in chief valuation barcode fetch");

  const Examiner_Details = await db.faculties.findOne({
    where: {
      Eva_Id: Evaluator_Id,
    },
  });

  let Examiner_Name = Examiner_Details ? Examiner_Details.FACULTY_NAME : "Unknown Examiner";
  const flname = `import${valuation_type}`;
  const model = db[flname];

  let ChifValuationData;

  if (chiefValuationtype == "1") {

    ChifValuationData = await model.findAll({
      where: {
        subcode: subcode,
        Eva_Mon_Year: Eva_Mon_Year,
        Evaluator_Id: Evaluator_Id,
        Checked: "Yes",
        E_flg: "Y",
        Chief_Checked: "NO",
        [Op.or]: [
          { Chief_Flg: "N" },
          { Chief_Flg: "A" },
        ],
      },
      order: [
        ["checkdate", "DESC"],
        ["subcode", "ASC"],
        ["barcode", "ASC"],
      ],
      attributes: [
        "barcode",
        "subcode",
        "Evaluator_Id",
        "Eva_Mon_Year",
        "tot_round",
        "checkdate",
        "Camp_id",
        "camp_offcer_id_examiner",
        "Chief_Flg",
        "Checked",
      ],
    });
  }

  else {
    ChifValuationData = await model.findAll({
      where: {
        subcode: subcode,
        Eva_Mon_Year: Eva_Mon_Year,
        Evaluator_Id: Evaluator_Id,
        Checked: "Yes",
        E_flg: "Y",
        Chief_Checked: "NO",

        [Op.or]: [
          { Chief_Flg: "N" },
          { Chief_Flg: "E" },
          { Chief_Flg: "A" },
        ],
        [Op.and]: [
          { Chief_Checked: "NO" },
          { Chief_E_flg: "N" },
        ]

      },
      order: [
        ["checkdate", "DESC"],
        ["subcode", "ASC"],
        ["barcode", "ASC"],
      ],
      attributes: [
        "barcode",
        "subcode",
        "Evaluator_Id",
        "Eva_Mon_Year",
        "tot_round",
        "checkdate",
        "Camp_id",
        "camp_offcer_id_examiner",
        "Chief_Flg",
        "Checked",
      ],
    });
  }

  console.log(Examiner_Name, "Chief Valuation Data fetched for chief valuation barcode fetch");


  res.status(200).json({
    data: ChifValuationData,
    Examiner_Name: Examiner_Name,
  });
});
const valuation_chief_Barcode_Data = asyncHandler(async (req, res) => {
  const {
    barcode,
    subcode,
    Examiner_type,
    valuation_type,
    Eva_Id,
    Eva_Mon_Year,
    Examiner_Id,
    camp_id_chief,
    camp_offcer_id_examiner,
    chief_valuation_Meth,
  } = req.query;

  console.log(req.query, "req query for valuation chief barcode data");

  const ClintIP = getClientIP(req);
  const flname = `import${valuation_type}`;
  const model = db[flname];

  let Chief_E_flg;
  if (chief_valuation_Meth == "R") {
    Chief_E_flg = "N";
    Chief_Valuation_Evaluator_Id = null;
    Chief_Eva_id = Examiner_Id;
  } else if (chief_valuation_Meth == "V") {
    Chief_E_flg = "A";
    Chief_Valuation_Evaluator_Id = Examiner_Id;
    Chief_Eva_id = null;

  }
  else {
    Chief_E_flg = "A";
    Chief_Valuation_Evaluator_Id = Examiner_Id;
    Chief_Eva_id = null;
  }
  let Chief_Valuation_Barcode_Data;
  if (Examiner_type == Examiner_type) {
    Chief_Valuation_Barcode_Data = await model.findOne({
      where: {
        subcode: subcode,
        barcode: barcode,
        Evaluator_Id: Eva_Id,
        Checked: "Yes",
        E_flg: "Y",
        Chief_Flg: "N",
        Chief_Checked: "NO",
        [Op.or]: [{ Chief_Flg: "N" }, { Chief_Flg: "A" }],
      },
    });

    Chief_Valuation_Barcode_Data.update({
      Chief_E_flg: Chief_E_flg,
      Chief_Valuation_Evaluator_Id: Chief_Valuation_Evaluator_Id,
      Chief_A_date: getCurrentISTDateTime(),
      Chief_Evaluator_Id: Chief_Eva_id,
      Chief_ip: ClintIP,

    });
  } else if (Examiner_type == 1) {
    Chief_Valuation_Barcode_Data = await model.findOne({
      where: {
        subcode: subcode,
        barcode: barcode,
        Evaluator_Id: Eva_Id,
        Checked: "Yes",
        E_flg: "Y",
        Chief_Flg: "N",
        Chief_Checked: "NO",
        [Op.or]: [{ Chief_E_flg: "N" }, { Chief_E_flg: "A" }],
      },
    });




    Chief_Valuation_Barcode_Data.update({
      Chief_E_flg: Chief_E_flg,
      Chief_Evaluator_Id: Chief_Eva_id,
    });
  } else {
    res.status(201);
    throw new AppError("Invalid Examiner Type for Chief Valuation", 201);
  }
  res.status(200).json({
    data: Chief_Valuation_Barcode_Data,
  });
});

const valuation_marks_preview_date = asyncHandler(async (req, res) => {
  const { Eva_Id, Dept_Code, Selected_Role } = req.query;
  console.log("Received Eva_Id:", Eva_Id);
  console.log("Query params:", req.query);

  let RecordId = 1;
  if (!Eva_Id) {
    res.status(400);
    throw new AppError("Evaluator ID is required", 400);
  }

  const Valuation_Date = {
    "Evaluator_Id": Eva_Id,
    "Exam_Month_Year": getCurrentISTDateTime(),
    "checkdates": []
  }

  for (let i = 1; i <= 4; i++) {

    const flname = `import${i}`;
    const model = db[flname];

    if (Selected_Role === "2") {
      sql = `SELECT "Evaluator_Id", "subcode", SUBSTRING("checkdate", 1, 10) AS "check_date", COUNT("id") AS "Total_Papers",
SUM(COUNT("id")) OVER (PARTITION BY "Evaluator_Id", SUBSTRING("checkdate", 1, 10)) AS "Date_Total_Papers"
FROM "${flname}"
WHERE "Evaluator_Id" = :Eva_Id AND "Checked" = 'Yes'
GROUP BY "Evaluator_Id", "subcode", SUBSTRING("checkdate", 1, 10)
ORDER BY SUBSTRING("checkdate", 1, 10) ASC;
`;
    } else if (Selected_Role === "1") {

      sql = `SELECT "Chief_Valuation_Evaluator_Id" as "Evaluator_Id", "subcode", SUBSTRING("Chief_checkdate_Valuation", 1, 10) AS "check_date", COUNT("id") AS "Total_Papers",
SUM(COUNT("id")) OVER (PARTITION BY "Chief_Valuation_Evaluator_Id", SUBSTRING("Chief_checkdate_Valuation", 1, 10)) AS "Date_Total_Papers"
FROM "${flname}"
WHERE "Chief_Valuation_Evaluator_Id" = :Eva_Id AND "Chief_Checked" = 'Yes'
GROUP BY "Chief_Valuation_Evaluator_Id", "subcode", SUBSTRING("Chief_checkdate_Valuation", 1, 10)
ORDER BY SUBSTRING("Chief_checkdate_Valuation", 1, 10) ASC;
`;
    }

    const checkdates = await db.sequelize.query(sql, {
      replacements: { Eva_Id: Eva_Id },
      type: db.sequelize.QueryTypes.SELECT
    });

    // const checkdates = await model.findAll({
    //   attributes: [
    //     'Evaluator_Id',
    //     'subcode',
    //     [Sequelize.fn('SUBSTRING', Sequelize.col('checkdate'), 1, 10), 'check_date'],
    //     [Sequelize.fn('COUNT', Sequelize.col('id')), 'Total_Papers']
    //   ],
    //   where: {
    //     Evaluator_Id: Eva_Id,
    //     Checked: 'Yes'
    //   },
    //   group: ['Evaluator_Id', 'subcode', Sequelize.fn('SUBSTRING', Sequelize.col('checkdate'), 1, 10)],
    //   order: [[Sequelize.fn('SUBSTRING', Sequelize.col('checkdate'), 1, 10), 'ASC']],
    //   raw: true
    // });


    console.log(checkdates);

    checkdates.forEach(dateRecord => {
      Valuation_Date.checkdates.push({
        id: RecordId++,
        Evaluator_Id: dateRecord.Evaluator_Id,
        subcode: dateRecord.subcode,
        check_date: dateRecord.check_date,
        Total_Papers: dateRecord.Total_Papers,
        Date_Total_Papers: dateRecord.Date_Total_Papers,
        Valuation_Type: i,
        Dept_Code: Dept_Code
      });
    });

  }


  res.status(200).json({ data: Valuation_Date });

});


const valuation_marks_preview_data_examiner = asyncHandler(async (req, res) => {

  const { Evaluator_Id, check_date, Valuation_Type, Dept_Code, Select_Role, Dep_Name, Reports, Table_Dept_Code } = req.query;

  console.log({ Evaluator_Id, check_date, Valuation_Type, Dept_Code, Select_Role, Dep_Name, Reports, Table_Dept_Code }, "Query params for valuation marks preview data examiner");

  //return
  // Build where clause based on report type
  // Reports = "1" → Date Wise (filter by Evaluator_Id + check_date)
  // Reports = "2" → Subject Wise (filter by Evaluator_Id + subcode)
let whereClause

if (Select_Role === "2") {
whereClause = {
    Evaluator_Id: Evaluator_Id,
    Checked: 'Yes',
    ...(Reports === '1'
      ? {
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn('SUBSTRING', Sequelize.col('checkdate'), 1, 10),
            check_date
          )
        ]
      }
      : { subcode: Dept_Code }
    )
  };
} else if (Select_Role === "1") {
  whereClause = {
    Chief_Valuation_Evaluator_Id: Evaluator_Id,
    Chief_Checked: 'Yes',
    ...(Reports === '1'
      ? {
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn('SUBSTRING', Sequelize.col('Chief_checkdate_Valuation'), 1, 10),
            check_date
          )
        ]
      }
      : { subcode: Dept_Code }
    )
  };
}

  // Reports=1 → use Dept_Code directly; Reports=2 → use Table_Dept_Code (actual dept, Dept_Code is subcode)
  const valDataTableCode = Reports === '1' ? Dept_Code : (Table_Dept_Code || Dept_Code);

  console.log(whereClause, "Constructed where clause for valuation data query");
 // return
  const flname = `import${Valuation_Type}`;
  const model = db[flname];
  const sub_master = db.sub_master;
  const valuation_data = await model.findAll({
    attributes: [
      'id',
      'barcode',
      'subcode',
      'total',
      'tot_round',
      [Sequelize.fn('SUBSTRING', Sequelize.col('checkdate'), 1, 10), 'check_date']
    ],
    where: whereClause,
    order: [
      ['subcode', 'ASC'],
      ['barcode', 'ASC']
    ],
  });

  if (!valuation_data || valuation_data.length === 0) {
    res.status(404);
    throw new AppError("No valuation data found for the given date", 404);
  }

  // Fetch subject names for all unique subcodes
  const subcodes = [...new Set(valuation_data.map(record => record.subcode))];
  const subjectNames = await sub_master.findAll({
    attributes: ['Subcode', 'SUBNAME'],
    where: {
      Subcode: { [Op.in]: subcodes }
    }
  });

  // Create a map of subcode to subject name
  const subjectNameMap = {};
  subjectNames.forEach(sub => {
    subjectNameMap[sub.Subcode] = sub.SUBNAME;
  });

  // Add subject names to valuation_data
  const enrichedValuationData = valuation_data.map(record => ({
    ...record.toJSON(),
    subject_name: subjectNameMap[record.subcode] || 'Unknown'
  }));


  const flnamevaldata = `val_data_${Dep_Name}`;

  console.log(flnamevaldata, "Valuation data table name for fetching val_data records");
  const modelvaldata = db[flnamevaldata];

  if (!modelvaldata) {
    res.status(400);
    throw new AppError(`Table val_data_${Dep_Name} not found. Check Dept_Code / Dep_Name value.`, 400);
  }
  const barcodes = valuation_data.map(record => record.barcode);
  const valDataRecords = await modelvaldata.findAll({
    attributes: [
      'id',
      'barcode',
      'eva_id',
      'qbno',
      'section',
      'sub_section',
      'Marks_Get',
      'valid_qbs'
    ],
    where: {
      barcode: { [Op.in]: barcodes },
      eva_id: Evaluator_Id,
      Examiner_type: Select_Role === "2" ? "2" : "1"
    },
    order: [
      ['barcode', 'ASC'],
      ['qbno', 'ASC'],
      ['section', 'ASC'],
      ['sub_section', 'ASC']
    ]
  });
  console.log(enrichedValuationData, "Enriched Valuation Data");

  res.status(200).json({
    data: enrichedValuationData,
    val_data: valDataRecords
  });

});




const evaluator_checkdates = asyncHandler(async (req, res) => {
  const { evaluator_id } = req.body;

  if (!evaluator_id) {
    res.status(400);
    throw new AppError("Evaluator ID is required", 400);
  }

  const import1 = db.import1;

  const checkdates = await import1.findAll({
    attributes: [
      'Evaluator_Id',
      [Sequelize.fn('SUBSTRING', Sequelize.col('checkdate'), 1, 10), 'check_date']
    ],
    where: {
      Evaluator_Id: evaluator_id
    },
    group: ['Evaluator_Id', Sequelize.fn('SUBSTRING', Sequelize.col('checkdate'), 1, 10)],
    order: [[Sequelize.fn('SUBSTRING', Sequelize.col('checkdate'), 1, 10), 'ASC']],
    raw: true
  });

  if (!checkdates || checkdates.length === 0) {
    res.status(404);
    throw new AppError("No check dates found for this evaluator", 404);
  }

  res.status(200).json({
    success: true,
    count: checkdates.length,
    data: checkdates
  });
});

const valuation_Remarks_Malpractice = asyncHandler(async (req, res) => {

  console.log("Valuation Remarks Malpractice endpoint hit", "request body: ", req.body);

  const { subject, reason, description, barcode, sub_code, sub_name, Camp_id, camp_offcer_id_examiner, Examiner_type, Modal_Type, Eva_Id, Eva_Name, Dep_Name } = req.body;

  if (!subject || !reason || !description || !barcode || !sub_code || !sub_name || !Camp_id || !camp_offcer_id_examiner || !Examiner_type || !Modal_Type || !Eva_Id || !Eva_Name || !Dep_Name) {
    res.status(400);
    throw new AppError("All fields are required", 400);
  }

  let flname = `valuation_remarks`;

  // if (Modal_Type == 2) {
  //   console.log("Valuation Remarks Malpractice for Examiner", "request body: ", req.body);
  // } else if (Modal_Type == 1) {



  const malpracticeRecord = await db[flname].create({

    RemarksSubject: subject,
    remarks_reasons: reason,
    msg: description,
    Dummy_Number: barcode,
    evaluator_subject: `${sub_code} - ${sub_name}`,
    evaluator_id: Eva_Id,
    evaluator_name: Eva_Name,
    Campid: Camp_id,
    Campofficerid: camp_offcer_id_examiner,
    Examiner_Type: Examiner_type,
    Remarks_Type: Modal_Type,
    Dep_Name: Dep_Name
  });

  console.log("Valuation Remarks Malpractice for Chief Examiner", "request body: ", req.body, "Created Record: ", malpracticeRecord);




  // } else {
  //   res.status(400);
  //   throw new AppError("Invalid Modal Type", 400);
  // }



  res.status(200).json({ message: "Valuation Remarks Malpractice endpoint hit" });
});

const valuation_timing = asyncHandler(async (req, res) => {

  const { evaluator_id } = req.query;

  if (!evaluator_id) {
    res.status(400);
    throw new AppError("Evaluator ID is required", 400);
  }

  let importData = [];

  for (let i = 1; i <= 4; i++) {
    const flname = `import${i}`;
    const model = db[flname];

    const timingData = await model.findAll({
      attributes: [
        'Evaluator_Id',
        'barcode',
        'subcode',
        'tot_round',
        'checkdate',
        'A_date',
        [Sequelize.literal(`'${i}'`), 'valuation_type']
      ],

      where: {
        Evaluator_Id: evaluator_id,
        
        Checked: 'Yes',
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn('SUBSTRING', Sequelize.col('checkdate'), 1, 10),
            getCurrentISTDateTime().substring(0, 10)
          )
        ]
      },

      order: [[Sequelize.cast(Sequelize.col('checkdate'), 'TIMESTAMP'), 'DESC']],
      raw: true
    });

    // Calculate time difference for each record
    if (timingData && timingData.length > 0) {
      const enrichedTimingData = timingData.map(record => {
        console.log(`Record ${record.barcode} - checkdate:`, record.checkdate, 'A_date:', record.A_date);
        const timeDiff = calculateTimeDifference(record.A_date, record.checkdate);
        console.log(`Time difference for ${record.barcode}:`, timeDiff);
        return {
          ...record,
          time_taken: timeDiff
        };
      });

      importData.push(...enrichedTimingData);
      console.log(`Timing data for import${i}:`, enrichedTimingData.length, 'records');
    }
  }

  res.status(200).json({
    message: "Valuation Timing data fetched successfully",
    count: importData.length,
    data: importData
  });
})

const Chief_Review_Data_Update = asyncHandler(async (req, res) => {
  const { barcode, subcode, Eva_Id, Eva_Mon_Year, valuation_type, Dep_Name, Examiner_type, Examiner_Eva_id, Chief_Flg, remarks, evaluator_name, Evaluator_Id } = req.body;


  if (!barcode || !subcode || !Eva_Id || !Eva_Mon_Year || !valuation_type || !Dep_Name || !Examiner_type || !Examiner_Eva_id || !Chief_Flg) {
    res.status(400);
    throw new AppError("All required fields must be provided", 400);
  }

  let flname = `import${valuation_type}`;
  console.log("Table name:", flname);

  const model = db[flname];

  const Data_Get = await model.findOne({
    where: {
      barcode: barcode,
      subcode: subcode,
      Eva_Mon_Year: Eva_Mon_Year,
      Evaluator_Id: Examiner_Eva_id,
      Checked: "Yes",
      E_flg: "Y",
    },
  });

  console.log(Data_Get, "Data fetched for Chief Review Data Update");

  if (!Data_Get) {
    res.status(404);
    throw new AppError("Data not found for the given barcode and subcode", 404);
  }

  if (Chief_Flg == "Y") {
    await Data_Get.update({
      Chief_Flg: "Y",
      Chief_Evaluator_Id: Eva_Id
    });

    res.status(200).json({
      message: "Chief review accepted successfully",
      data: Data_Get
    });
  } else {
    await Data_Get.update({
      Chief_Flg: "E",
      Chief_Evaluator_Id: Eva_Id,
      Checked: "NO",
      E_flg: "A",
    });


    const RemarkExist = await db.chief_remarks.findOne({
      where: {
        Barcode: barcode,
        evaluator_subject: subcode,
        view_status: "N"
      }
    });

    let Remarks_Update;

    if (RemarkExist) {
      Remarks_Update = await RemarkExist.update({
        evaluator_id: Eva_Id,
        evaluator_name: evaluator_name,
        msg: remarks,
        view_status: "N"
      });
    } else {
      Remarks_Update = await db.chief_remarks.create({
        Barcode: barcode,
        evaluator_subject: subcode,
        evaluator_id: Eva_Id,
        evaluator_name: evaluator_name,
        msg: remarks,
        view_status: "N"
      });
    }

    res.status(200).json({
      message: "Chief review rejected, revaluation required",
      data: Data_Get,
      remarks: Remarks_Update
    });
  }
})



const rejectedByChief = asyncHandler(async (req, res) => {
  const { barcode, subcode, eva_id, valuation_type } = req.body;

  if (!barcode || !subcode || !eva_id || !valuation_type) {
    res.status(400);
    throw new AppError("All required fields must be provided", 400);
  }

  let flname = `import${valuation_type}`;
  const model = db[flname];

  const rejectedRecord = await model.findOne({
    where: {
      barcode: barcode,
      subcode: subcode,
      Evaluator_Id: eva_id,
      Checked: "NO",
      E_flg: "A",
      Chief_Flg: "E"
    },
  });

  if (!rejectedRecord) {
    res.status(201).json({
      message: "No record found that was rejected by chief examiner",
      isDataThere: false
    });
    return;

  }

  const Remarks_Get = await db.chief_remarks.findOne({
    where: {
      Barcode: barcode,
      evaluator_subject: subcode,
      view_status: "N"
    }
  });



  res.status(200).json({
    message: "Record found that was rejected by chief examiner",
    data: rejectedRecord,
    remarks: Remarks_Get,
    isDataThere: true
  });

})


const ValuationpendingUpdate = asyncHandler(async (req, res) => {

  const { barcode, subcode, Eva_Id, Valuation_Type, Examiner_type, Dep_Name } = req.body;

  let flname = `import${Valuation_Type}`;
  let flname_valdata = `val_data_${Dep_Name}`;

  const ValDataUpdated = await db[flname_valdata].findAll({
    where: {
      barcode: barcode,
      subcode: subcode,
      eva_id: Eva_Id,
      valuation_type: Valuation_Type,
      Examiner_type: Examiner_type,
      Dep_Name: Dep_Name
    }
  });

  if (ValDataUpdated.length === 0) {
    const model = db[flname];

    if (Examiner_type == 2) {
      await model.update(
        {
          Checked: "NO",
          E_flg: "N",
        },
        {
          where: {
            barcode: barcode,
            subcode: subcode,
            Evaluator_Id: Eva_Id,
            Checked: "NO",
            E_flg: "A",
          },
        }
      );
    } else if (Examiner_type == 1) {
      await model.update(
        {
          Chief_Checked: "NO",
          Chief_E_flg: "N",
        },
        {
          where: {
            barcode: barcode,
            subcode: subcode,
            Chief_Valuation_Evaluator_Id: eva_id,
            Chief_Checked: "NO",
            Chief_E_flg: "A",
          },
        }
      );
    }
  }

  res.status(200).json({
    message: "Valuation pending update endpoint hit successfully",
    requestBody: req.body
  });

});


const ExaminerTotalMarksGet = asyncHandler(async (req, res) => {
  const { barcode, subcode, Eva_Id, Valuation_Type, valuation_type } = req.query;
  const resolvedValuationType = Valuation_Type || valuation_type;

  let flname = `import${resolvedValuationType}`;
  const model = db[flname];

  if (!model) {
    res.status(400);
    throw new AppError(`Invalid valuation type: ${Valuation_Type}`, 400);
  }

  const record = await model.findOne({
    where: {
      batchname: barcode,
      subcode: subcode,
      Evaluator_Id: Eva_Id,
    },
    attributes: ['total', 'tot_round']
  });

  if (!record) {
    res.status(404).json({
      message: "No record found for the given barcode and subcode",
      data: null
    });
    return;
  }

  res.status(200).json({
    message: "Total marks fetched successfully",
    data: record
  });

})

module.exports = {
  subcode_Fetech,
  valuation_Barcode_Fetch,
  valuation_Image_Fetch,
  valuation_Data_Update,
  examminer_valuation_data_get,
  valuation_Finalize,
  examiner_review_data_get,
  examiner_review_value_data_get,
  chief_valuation_Barcode_Fetch,
  valuation_chief_Barcode_Data,
  valuation_marks_preview_date,
  valuation_marks_preview_data_examiner,
  evaluator_checkdates,
  valuation_Remarks_Malpractice,
  valuation_timing,
  Chief_Review_Data_Update,
  rejectedByChief,
  ValuationpendingUpdate,
  ExaminerTotalMarksGet
};