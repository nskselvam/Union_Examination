const AppError = require('../utils/appError');
const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const db = require('../db/models');
const path = require('path');
const fs = require('fs');

const getAllSubjects = asyncHandler(async (req, res, next) => {
    const subjects = await db.sub_master.findAll({

        order: [['Subcode', 'ASC']]
    });

    res.status(200).json({
        success: true,
        data: subjects
    });
});
const getQuestionPaperBySubcode = asyncHandler(async (req, res, next) => {
    console.log("=== PDF Request Debug ===");
    console.log("Raw req.body:", req.body);
    console.log("req.body type:", typeof req.body);
    console.log("Request headers:", req.headers);
    console.log("Request method:", req.method);
    console.log("Request content-type:", req.get('content-type'));
    console.log("========================");
    
    if (!req.body || typeof req.body !== 'object') {
        return next(new AppError('Request body is missing or invalid', 400));
    }
    
    const { subcode, Dep_Name, Eva_Mon_Year, uploadType } = req.body || {};

    console.log("Received request for question paper with:", { subcode, Dep_Name, Eva_Mon_Year, uploadType });

    if (!subcode || !Dep_Name || !Eva_Mon_Year) {
        return next(new AppError('subcode, Dep_Name, and Eva_Mon_Year are required', 400));
    }

    // Determine folder based on uploadType
    let folderType;
    if(uploadType === 'question_paper') {
        folderType = 'qbs';
    } else if(uploadType === 'answer_key') {
        folderType = 'key';
    } else {
        return next(new AppError('Invalid upload type specified', 400));
    }

    // Try both .PDF and .pdf extensions
    let filePath = path.join(__dirname, '..', 'uploads', Eva_Mon_Year, folderType, Dep_Name, `${subcode}.PDF`);
    
    if (!fs.existsSync(filePath)) {
        // Try lowercase .pdf
        filePath = path.join(__dirname, '..', 'uploads', Eva_Mon_Year, folderType, Dep_Name, `${subcode}.pdf`);
    }
    
    console.log("Constructed file path:", filePath);
    console.log("File exists:", fs.existsSync(filePath));

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        console.error("PDF file not found at:", filePath);
        const fileType = uploadType === 'answer_key' ? 'Answer key' : 'Question paper';
        return next(new AppError(`${fileType} PDF not found for ${subcode}`, 404));
    }

    // Set headers for PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${subcode}.pdf"`);
    
    // Send the PDF file
    res.sendFile(filePath);
});

const QuestionAnswerUpload = asyncHandler(async (req, res, next) => {
    const { subcode, Dep_Name, Eva_Mon_Year ,uploadType} = req.body;
    const file = req.file;

    if (!subcode || !Dep_Name || !Eva_Mon_Year || !file) {
        return next(new AppError('subcode, Dep_Name, Eva_Mon_Year and file are required', 400));
    }

    // Determine folder based on uploadType
    let folderType;
    if(uploadType === 'question_paper') {
        folderType = 'qbs';
    } else if(uploadType === 'answer_key') {
        folderType = 'key';
    } else {
        return next(new AppError('Invalid upload type specified', 400));
    }

    const uploadPath = path.join(__dirname, '..', 'uploads', Eva_Mon_Year, folderType, Dep_Name);
    
    // Ensure the directory exists
    fs.mkdirSync(uploadPath, { recursive: true });

    const filePath = path.join(uploadPath, `${subcode}.PDF`);

    // Move the uploaded file to the correct location
    fs.rename(file.path, filePath, async (err) => {
        if (err) {
            console.error("Error moving uploaded file:", err);
            return next(new AppError('Failed to save uploaded file', 500));
        }
        const Sub_Master = db.sub_master;
        try {
            await Sub_Master.update(
                uploadType === 'question_paper' ? { qb_flg: 'Y' } : { ans_flg: 'Y' },
                { where: { Subcode: subcode } }
            );
            
            res.status(200).json({
                success: true,
                message: `${uploadType === 'question_paper' ? 'Question paper' : 'Answer key'} uploaded successfully`,
                data: { subcode, Dep_Name, Eva_Mon_Year }
            });
        } catch (dbError) {
            console.error("Error updating database:", dbError);
            return next(new AppError('Failed to update database', 500));
        }
    });
});

module.exports = {
    getAllSubjects,
    getQuestionPaperBySubcode,
    QuestionAnswerUpload
};