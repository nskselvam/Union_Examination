const AppError = require('../utils/appError');
const asyncHandler = require('express-async-handler');
const { Op, where, or } = require('sequelize');
const db = require('../db/models');
const bcrypt = require('bcrypt');
const generatePasword = require('../utils/passwordGenerate');
const sendSMS = require('../utils/sendSms');
const e = require('express');

const getExaminerPassword = asyncHandler(async (req, res, next) => {
    const { Dep_Name, Eva_Mon_Year } = req.query || {};

    console.log("Received request for examiner password with:", { Dep_Name, Eva_Mon_Year });

    if (!Dep_Name || !Eva_Mon_Year) {
        return next(new AppError('Dep_Name and Eva_Mon_Year are required', 400));
    }

    const examiner = await db.faculties.findAll({
        where: {
            ResetPass: "1",
        },

        attributes: ['Eva_Id', 'FACULTY_NAME', 'Role', 'updatedAt', 'id'],
    });

    res.status(200).json({
        success: true,
        data: examiner
    });

});


const ExaminerPasswordReset = asyncHandler(async (req, res, next) => {
    const { id } = req.body || {};

    if (!id) {
        return next(new AppError('Examiner ID is required', 400));
    }

    const examiner = await db.faculties.findOne({ where: { id } });

    if (!examiner) {
        return next(new AppError('Examiner not found', 404));
    }

    const newPassword = generatePasword();
    const hashedPassword = await bcrypt.hash(newPassword, bcrypt.genSaltSync(10));
    examiner.Password = hashedPassword;
    examiner.ResetPass = "0";
    examiner.Temp_Password = newPassword;

    // Send SMS if mobile number is available
    let smsStatus = 'Not Sent';
    if (examiner.Mobile_Number) {
        const smsMessage = `Dear Sir/Madam, Your User Id ${examiner.Eva_Id} & Password is ${examiner.Temp_Password} for SRMIST DEMS evaluation (https://dems.srmist.edu.in) - SRMIST`;
        const smsResult = await sendSMS(examiner.Mobile_Number, smsMessage);
        console.log('SMS Result:', smsResult);

        if (smsResult.success) {

            examiner.sms_status = 'Sent';
        } else {

            examiner.sms_status = 'Failed';
        }
    }

    await examiner.save();

    res.status(200).json({
        success: true,
        message: `Password reset successful for examiner ID ${id}`,
        data: examiner
    });
});

const getExaminerpassword_details = asyncHandler(async (req, res, next) => {
    // const { id } = req.query || {};



    const examiner = await db.faculties.findAll({
        where: {
            ResetPass: "0",
            [Op.or]: [
                { sms_status: { [Op.ne]: 'Sent' } },
                { sms_status: { [Op.is]: null } },
                { sms_status: '' }
            ]
        },
        attributes: ['Eva_Id', 'FACULTY_NAME', 'Role', 'updatedAt', 'Temp_Password', 'Mobile_Number', 'Email_Id', 'sms_status', 'id'],
        order: [['Eva_Id', 'ASC']]
    });

    if (!examiner || examiner.length === 0) {
        return next(new AppError('Examiner not found', 404));
    }

    res.status(200).json({
        success: true,
        data: examiner
    });
});


const passwordsend = asyncHandler(async (req, res, next) => {
    const PasswordDetails = await db.faculties.findAll({
        where: {
            [Op.or]: [
                { Sms_Status: { [Op.ne]: 'Sent' } },
                { Sms_Status: { [Op.is]: null } },
                { Sms_Status: '' }
            ],
            ResetPass: '0'

        }
    });

    if (!PasswordDetails || PasswordDetails.length === 0) {
        return next(new AppError('Examiner not found', 404));
    }

    for (const examiner of PasswordDetails) {
        if (examiner.Mobile_Number) {
            const smsMessage = `Dear Sir/Madam, Your User Id ${examiner.Eva_Id} & Password is ${examiner.Temp_Password} for SRMIST DEMS evaluation (https://dems.srmist.edu.in) - SRMIST`;
            const smsResult = await sendSMS(examiner.Mobile_Number, smsMessage);
            console.log('SMS Result:', smsResult);

           

            if (smsResult.success) {
                console.log('SMS Status: Sent');
                examiner.sms_status = 'Sent';
               // examiner.ResetPass = '1';
            } else {
                console.log('SMS Status: Failed');
                examiner.sms_status = 'Failed';
            }
            await examiner.save();
        }
    }

    res.status(200).json({
        success: true,
        message: `Password details SMS sending process completed`,
        data: PasswordDetails
    });

});
const getexamienrdetails = asyncHandler(async (req, res, next) => {
    const {Eva_Id, Role,Dep_Name} = req.body || {};
    console.log("Received request for examiner details with:", req.body);
    const Dep_Name_Field = `Dep_Name_${Role}`;
    const examinerDetails = await db.faculties.findAll({
        where: {
            Eva_Id: String(Eva_Id).replace(/[\r\n\t\s]/g, ""),
            Role: {
                [Op.like]: `%${Role}%`
            },
            [Dep_Name_Field]: {
                [Op.like]: `%${Dep_Name}%`
            }
        },
        attributes: ['Eva_Id', 'FACULTY_NAME', 'Role', 'updatedAt', 'Temp_Password', 'Mobile_Number', 'Email_Id', 'Sms_Status', 'id'],
        order: [['Eva_Id', 'ASC']]
    });

    console.log("Received request for examiner details with Eva_Id:", examinerDetails);

    // If no examiner found, return success with empty data (not an error)
    // This allows the frontend to distinguish between "user not found" (can add) and actual errors
    if (!examinerDetails || examinerDetails.length === 0) {
        return res.status(200).json({
            success: true,
            data: [],
            message: 'No examiner found with this ID'
        });
    }

    res.status(200).json({
        success: true,
        data: examinerDetails
    });
});

const examinerSubjectDetailsUpdateInsert = asyncHandler(async (req, res, next) => {
   
    console.log("Received request for examiner subject details update/insert with:", req.body);

    // if (!Eva_Id) {
    //     return next(new AppError('Examiner ID (Eva_Id) is required', 400));
    // }

    // let examiner = await db.faculties.findOne({ where: { Eva_Id } });
});

const getexaminercrosscheck = asyncHandler(async (req, res, next) => {

    const facultiesData = await db.faculties.findAll({});
    const results = [];

    for (const faculty of facultiesData) {
        let Role_Status = faculty.Role ? faculty.Role.split(',').map(s => s.trim()) : [];
        let facultyRemarks = [];

        for (const role of Role_Status) {
            switch (role) {
                case '1': {
                    // Chief Examiner arrays
                    const fields = {
                        'Chief_subcode':          faculty.Chief_subcode          ? faculty.Chief_subcode.split(',').map(s => s.trim())          : [],
                        'Chief_Eva_Subject':      faculty.Chief_Eva_Subject      ? faculty.Chief_Eva_Subject.split(',').map(s => s.trim())      : [],
                        'chief_examiner':         faculty.chief_examiner         ? faculty.chief_examiner.split(',').map(s => s.trim())         : [],
                        'camp_offcer_id_chief':   faculty.camp_offcer_id_chief   ? faculty.camp_offcer_id_chief.split(',').map(s => s.trim())   : [],
                        'Camp_id_chief':          faculty.Camp_id_chief          ? faculty.Camp_id_chief.split(',').map(s => s.trim())          : [],
                        'Chief_Valuation_Status': faculty.Chief_Valuation_Status ? faculty.Chief_Valuation_Status.split(',').map(s => s.trim()) : [],
                        'Dep_Name_1':             faculty.Dep_Name_1             ? faculty.Dep_Name_1.split(',').map(s => s.trim())             : [],
                    };

                    const counts = Object.entries(fields).map(([key, arr]) => ({ key, count: arr.length }));
                    const uniqueCounts = [...new Set(counts.map(c => c.count))];

                    if (uniqueCounts.length > 1) {
                        const mismatchInfo = counts.map(c => `${c.key}(${c.count})`).join(', ');
                        facultyRemarks.push(`Role1 Mismatch: ${mismatchInfo}`);
                    }
                    break;
                }

                case '2': {
                    // Examiner arrays
                    const fields = {
                        'subcode':                    faculty.subcode                    ? faculty.subcode.split(',').map(s => s.trim())                    : [],
                        'Eva_Subject':                faculty.Eva_Subject                ? faculty.Eva_Subject.split(',').map(s => s.trim())                : [],
                        'Sub_Max_Paper':              faculty.Sub_Max_Paper              ? faculty.Sub_Max_Paper.split(',').map(s => s.trim())              : [],
                        'camp_offcer_id_examiner':    faculty.camp_offcer_id_examiner    ? faculty.camp_offcer_id_examiner.split(',').map(s => s.trim())    : [],
                        'Camp_id':                    faculty.Camp_id                    ? faculty.Camp_id.split(',').map(s => s.trim())                    : [],
                        'Examiner_Valuation_Status':  faculty.Examiner_Valuation_Status  ? faculty.Examiner_Valuation_Status.split(',').map(s => s.trim())  : [],
                        'Dep_Name_2':                 faculty.Dep_Name_2                 ? faculty.Dep_Name_2.split(',').map(s => s.trim())                 : [],
                    };

                    const counts = Object.entries(fields).map(([key, arr]) => ({ key, count: arr.length }));
                    const uniqueCounts = [...new Set(counts.map(c => c.count))];

                    if (uniqueCounts.length > 1) {
                        const mismatchInfo = counts.map(c => `${c.key}(${c.count})`).join(', ');
                        facultyRemarks.push(`Role2 Mismatch: ${mismatchInfo}`);
                    }
                    break;
                }

                // case '7': {
                //     // Chief Valuation Examiner arrays (same as role 1 structure)
                //     const fields = {
                //         'Chief_subcode':          faculty.Chief_subcode          ? faculty.Chief_subcode.split(',').map(s => s.trim())          : [],
                //         'Chief_Eva_Subject':      faculty.Chief_Eva_Subject      ? faculty.Chief_Eva_Subject.split(',').map(s => s.trim())      : [],
                //         'chief_examiner':         faculty.chief_examiner         ? faculty.chief_examiner.split(',').map(s => s.trim())         : [],
                //         'camp_offcer_id_chief':   faculty.camp_offcer_id_chief   ? faculty.camp_offcer_id_chief.split(',').map(s => s.trim())   : [],
                //         'Camp_id_chief':          faculty.Camp_id_chief          ? faculty.Camp_id_chief.split(',').map(s => s.trim())          : [],
                //         'Chief_Valuation_Status': faculty.Chief_Valuation_Status ? faculty.Chief_Valuation_Status.split(',').map(s => s.trim()) : [],
                //     };

                //     const counts = Object.entries(fields).map(([key, arr]) => ({ key, count: arr.length }));
                //     const uniqueCounts = [...new Set(counts.map(c => c.count))];

                //     if (uniqueCounts.length > 1) {
                //         const mismatchInfo = counts.map(c => `${c.key}(${c.count})`).join(', ');
                //         facultyRemarks.push(`Role7 Mismatch: ${mismatchInfo}`);
                //     }
                //     break;
                // }

                default:
                    break;
            }
        }

        const finalRemarks = facultyRemarks.length > 0 ? facultyRemarks.join(' | ') : 'OK';
        const vflg = facultyRemarks.length > 0 ? 1 : 0;

        // Save remarks and vflg to DB
        await db.faculties.update(
            { Remarks_Gen: finalRemarks, vflg: vflg },
            { where: { id: faculty.id } }
        );

        results.push({
            Eva_Id:       faculty.Eva_Id,
            FACULTY_NAME: faculty.FACULTY_NAME,
            Role:         faculty.Role,
            Remarks_Gen:  finalRemarks,
            vflg:         vflg,
        });
    }

    const mismatchCount = results.filter(r => r.Remarks_Gen !== 'OK').length;
    res.status(200).json({
        success: true,
        message: `Cross-check complete. ${mismatchCount} record(s) have mismatches.`,
        total:         results.length,
        mismatchCount: mismatchCount,
        data:          results,
    });
})

module.exports = { getExaminerPassword, ExaminerPasswordReset, getExaminerpassword_details, passwordsend, getexamienrdetails, getexaminercrosscheck };