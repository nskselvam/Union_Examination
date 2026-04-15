const asyncHandler = require("express-async-handler");
const db = require("../db/models");
const faculties = db.faculties;
const { Sequelize, Op } = require("sequelize");
const AppError = require("../utils/appError");
const bcrypt = require("bcrypt");
const generatePasword = require("../utils/passwordGenerate");


const getAllUserData = asyncHandler(async (req, res) => {
    const faculties_Data = await faculties.findAll();
    if (!faculties_Data) {
        throw new AppError('No user data found', 404);
    }
    res.status(200).json({
        status: 'success',
        data: faculties_Data,
    });
})

const createUserData = asyncHandler(async (req, res) => {
    const dataFromFormdataUserAdd = req.body;

    console.log("User Id", dataFromFormdataUserAdd.Eva_Id)

    let Dep_Name_Field = `Dep_Name_${dataFromFormdataUserAdd.Role}`;


    // const UserExist = await faculties.findOne({
    //     where: {
    //         Eva_Id: dataFromFormdataUserAdd.Eva_Id,
    //         Role: {
    //             [Op.like]: `%${dataFromFormdataUserAdd.Role}%`
    //         },
    //         [Dep_Name_Field]: {

    //             [Op.like]: `%${dataFromFormdataUserAdd.Dep_Name}%`
    //         }
    //     }
    // });
      let User_Roll_Admin= `User_Roll_Admin_${dataFromFormdataUserAdd.Role}`;
      let Role_Admin_Data = await db.roll_master.findOne({ where: { rollName: dataFromFormdataUserAdd.Role } });

    const UserExist = await faculties.findOne({
        where: {
            Eva_Id: String(dataFromFormdataUserAdd.Eva_Id).replace(/[\r\n\t\s]/g, ""),
        }
    });

    console.log("Data ", dataFromFormdataUserAdd)

    //return

    if (!UserExist) {
        console.log("Dep_Name_Field", Dep_Name_Field)

        const Password = generatePasword();

        //String(item.subcode || "").replace(/[\r\n\t\s]/g, "") : null,

        // Build user data object conditionally based on Role
        const userData = {
            // [Dep_Name_Field]: dataFromFormdataUserAdd.Dep_Name,
            Eva_Id: String(dataFromFormdataUserAdd.Eva_Id).replace(/[\r\n\t\s]/g, ""),
            FACULTY_NAME: String(dataFromFormdataUserAdd.FACULTY_NAME).replace(/[\r\n\t\s]/g, ""),
            Password: await bcrypt.hash(Password, bcrypt.genSaltSync(10)),
            Role: dataFromFormdataUserAdd.Role === "1" ? `${dataFromFormdataUserAdd.Role},7` : dataFromFormdataUserAdd.Role,
            Email_Id: String(dataFromFormdataUserAdd.Email_Id).replace(/[\r\n\t\s]/g, ""),
            Mobile_Number: String(dataFromFormdataUserAdd.Mobile_Number).replace(/[\r\n\t\s]/g, ""),
            Eva_Mon_Year: String(dataFromFormdataUserAdd.Eva_Mon_Month).replace(/[\r\n\t\s]/g, "") + "_" + String(dataFromFormdataUserAdd.Eva_Mon_Year).replace(/[\r\n\t\s]/g, ""),
            Temp_Password: Password,
            ResetPass: "0",
            servername: req.get("host"),
            Camp_id_Camp: dataFromFormdataUserAdd.Role === "4" ? String(dataFromFormdataUserAdd.Camp_Id).replace(/[\r\n\t\s]/g, "") : null

        };

        // Conditionally add fields based on Role
        if (dataFromFormdataUserAdd.Role == "1") {
            // Chief Examiner specific fields
            userData[Dep_Name_Field] = String(dataFromFormdataUserAdd.Dep_Name).replace(/[\r\n\t\s]/g, "");
            userData.Chief_subcode = dataFromFormdataUserAdd.Subject_Code || null;
            userData.chief_examiner = String(dataFromFormdataUserAdd.Eva_Id).replace(/[\r\n\t\s]/g, "");
            userData.Eva_Subject = String(dataFromFormdataUserAdd.Evaluation_Type).replace(/[\r\n\t\s]/g, "") || null;
            userData.Camp_id_chief = String(dataFromFormdataUserAdd.Camp_Id).replace(/[\r\n\t\s]/g, "") || null;
            userData.camp_offcer_id_chief = String(dataFromFormdataUserAdd.Camp_Officer_Id).replace(/[\r\n\t\s]/g, "") || null;
            userData.Chief_Valuation_Status = "N";
            userData.chief_examiner = String(dataFromFormdataUserAdd.Examiner_Id).replace(/[\r\n\t\s]/g, "");
            userData[User_Roll_Admin] = Role_Admin_Data ? (Role_Admin_Data.rollDescrption ? JSON.parse(Role_Admin_Data.rollDescrption).join(',') : null) : null;
            // userData.Max_Paper = "80";
        } else if (dataFromFormdataUserAdd.Role == "2") {
            // Examiner specific fields
            let subcode = dataFromFormdataUserAdd.Subject_Codes ? dataFromFormdataUserAdd.Subject_Codes.split(",").map(code => code.trim()) : [];
            let evasubject = "";
            let Camp_id = "";
            let camp_offcer_id_examiner = "";
            let Sub_Max_Paper = "";
            let Examiner_Valuation_Status = "";
            let Dep_Code = "";
            for (let i = 0; i < subcode.length; i++) {
                evasubject = evasubject + (i > 0 ? "," : "") + String(dataFromFormdataUserAdd.Evaluation_Type).replace(/[\r\n\t\s]/g, "");
                Camp_id = Camp_id + (i > 0 ? "," : "") + String(dataFromFormdataUserAdd.Camp_Id).replace(/[\r\n\t\s]/g, "");
                camp_offcer_id_examiner = camp_offcer_id_examiner + (i > 0 ? "," : "") + String(dataFromFormdataUserAdd.Camp_Officer_Id).replace(/[\r\n\t\s]/g, "");
                Sub_Max_Paper = Sub_Max_Paper + (i > 0 ? "," : "") + String(dataFromFormdataUserAdd.Total_Paper_In_Each_Subject).replace(/[\r\n\t\s]/g, "");
                Examiner_Valuation_Status = Examiner_Valuation_Status + (i > 0 ? "," : "") + "N";
                Dep_Code = Dep_Code + (i > 0 ? "," : "") + String(dataFromFormdataUserAdd.Dep_Name).replace(/[\r\n\t\s]/g, "");
            }
            userData.subcode = String(dataFromFormdataUserAdd.Subject_Codes).replace(/[\r\n\t\s]/g, "") || null;
            userData.Eva_Subject = String(evasubject).replace(/[\r\n\t\s]/g, "") || null;
            userData.Camp_id = String(Camp_id).replace(/[\r\n\t\s]/g, "") || null;
            userData.camp_offcer_id_examiner = String(camp_offcer_id_examiner).replace(/[\r\n\t\s]/g, "") || null;
            userData.Max_Paper = String(dataFromFormdataUserAdd.Maximum_Paper_in_Day).replace(/[\r\n\t\s]/g, "") || "0";
            userData.Sub_Max_Paper = String(Sub_Max_Paper).replace(/[\r\n\t\s]/g, "") || "0";
            userData.Examiner_Valuation_Status = String(Examiner_Valuation_Status).replace(/[\r\n\t\s]/g, "") || "N";
            userData[Dep_Name_Field] = String(Dep_Code).replace(/[\r\n\t\s]/g, "") || null;
            userData[User_Roll_Admin] = Role_Admin_Data ? (Role_Admin_Data.rollDescrption ? JSON.parse(Role_Admin_Data.rollDescrption).join(',') : null) : null;
        } else {
            userData[Dep_Name_Field] = String(dataFromFormdataUserAdd.Dep_Name).replace(/[\r\n\t\s]/g, "") || null;
            userData[User_Roll_Admin] = Role_Admin_Data ? (Role_Admin_Data.rollDescrption ? JSON.parse(Role_Admin_Data.rollDescrption).join(',') : null) : null;
        }

        const newUser = await faculties.create(userData);


    } else {

        let RoleData = UserExist.Role ? UserExist.Role.split(",") : [];
        let DepNameData = UserExist[Dep_Name_Field] ? UserExist[Dep_Name_Field].split(",") : [];

        if (dataFromFormdataUserAdd.Role == "1" && !RoleData.includes("1")) {

            let Chief_subcode = UserExist.Chief_subcode ? UserExist.Chief_subcode.split(",") : [];
            let Eva_Subject = UserExist.Chief_Eva_Subject ? UserExist.Chief_Eva_Subject.split(",") : [];
            let Camp_id_chief = UserExist.Camp_id_chief ? UserExist.Camp_id_chief.split(",") : [];
            let camp_offcer_id_chief = UserExist.camp_offcer_id_chief ? UserExist.camp_offcer_id_chief.split(",") : [];
            let Chief_Valuation_Status = UserExist.Chief_Valuation_Status ? UserExist.Chief_Valuation_Status.split(",") : [];
            let chief_examiner = UserExist.chief_examiner ? UserExist.chief_examiner.split(",") : [];

            Chief_subcode.push(dataFromFormdataUserAdd.Subject_Code || null);
            Eva_Subject.push(dataFromFormdataUserAdd.Evaluation_Type || null);
            Camp_id_chief.push(dataFromFormdataUserAdd.Camp_Id || null);
            camp_offcer_id_chief.push(String(dataFromFormdataUserAdd.Camp_Officer_Id).replace(/[\r\n\t\s]/g, "") || null);
            Chief_Valuation_Status.push("N");
            chief_examiner.push(String(dataFromFormdataUserAdd.Examiner_Id).replace(/[\r\n\t\s]/g, "") || null);
            DepNameData.push(String(dataFromFormdataUserAdd.Dep_Name).replace(/[\r\n\t\s]/g, "") || null);

            UserExist.Role = RoleData.length > 0 ? RoleData.join(",") + ",1,7" : "1,7";
            UserExist.Chief_subcode = Chief_subcode.join(",");
            UserExist.Chief_Eva_Subject = Eva_Subject.join(",");
            UserExist.Camp_id_chief = Camp_id_chief.join(",");
            UserExist.camp_offcer_id_chief = camp_offcer_id_chief.join(",");
            UserExist.Chief_Valuation_Status = Chief_Valuation_Status.join(",");
            UserExist.chief_examiner = chief_examiner.join(",");
            UserExist[Dep_Name_Field] = DepNameData.join(",");
            UserExist[User_Roll_Admin] = Role_Admin_Data ? (Role_Admin_Data.rollDescrption ? JSON.parse(Role_Admin_Data.rollDescrption).join(',') : null) : null;

            //9444070503

            // Handle Chief Examiner role update logic here if needed
        } else if (dataFromFormdataUserAdd.Role == "2" && !RoleData.includes("2")) {


            let subcode = UserExist.subcode ? UserExist.subcode.split(",") : [];
            let Eva_Subject = UserExist.Eva_Subject ? UserExist.Eva_Subject.split(",") : [];
            let Camp_id = UserExist.Camp_id ? UserExist.Camp_id.split(",") : [];
            let camp_offcer_id_examiner = UserExist.camp_offcer_id_examiner ? UserExist.camp_offcer_id_examiner.split(",") : [];
            let Sub_Max_Paper = UserExist.Sub_Max_Paper ? UserExist.Sub_Max_Paper.split(",") : [];
            let Examiner_Valuation_Status = UserExist.Examiner_Valuation_Status ? UserExist.Examiner_Valuation_Status.split(",") : [];
            let Dep_Code = UserExist[Dep_Name_Field] ? UserExist[Dep_Name_Field].split(",") : [];
            let formSubcode = dataFromFormdataUserAdd.Subject_Codes ? dataFromFormdataUserAdd.Subject_Codes.split(",").map(code => code.trim()) : [];


            for (let i = 0; i < formSubcode.length; i++) {
                if (!subcode.includes(formSubcode[i])) {
                    subcode.push(formSubcode[i]);
                    Eva_Subject.push(dataFromFormdataUserAdd.Evaluation_Type || null);
                    Camp_id.push(dataFromFormdataUserAdd.Camp_Id || null);
                    camp_offcer_id_examiner.push(dataFromFormdataUserAdd.Camp_Officer_Id || null);
                    Sub_Max_Paper.push(String(dataFromFormdataUserAdd.Total_Paper_In_Each_Subject).replace(/[\r\n\t\s]/g, "") || "0");
                    Examiner_Valuation_Status.push("N");
                    Dep_Code.push(dataFromFormdataUserAdd.Dep_Name);
                }
            }

            UserExist.Role = RoleData.length > 0 ? RoleData.join(",") + ",2" : "2";
            UserExist.subcode = subcode.join(",");
            UserExist.Eva_Subject = Eva_Subject.join(",");
            UserExist.Camp_id = Camp_id.join(",");
            UserExist.camp_offcer_id_examiner = camp_offcer_id_examiner.join(",");
            UserExist.Max_Paper = String(dataFromFormdataUserAdd.Maximum_Paper_in_Day).replace(/[\r\n\t\s]/g, "") || "0";
            UserExist.Sub_Max_Paper = Sub_Max_Paper.join(",");
            UserExist.Examiner_Valuation_Status = Examiner_Valuation_Status.join(",");
            UserExist[Dep_Name_Field] = Dep_Code.join(",");
            UserExist[User_Roll_Admin] = Role_Admin_Data ? (Role_Admin_Data.rollDescrption ? JSON.parse(Role_Admin_Data.rollDescrption).join(',') : null) : null;



            // Handle Examiner role update logic here if needed
        } else {
            if (!RoleData.includes(dataFromFormdataUserAdd.Role)) {
                RoleData.push(dataFromFormdataUserAdd.Role);
            }
            DepNameData.push(dataFromFormdataUserAdd.Dep_Name);
            UserExist.Role = RoleData.join(",");
            UserExist[Dep_Name_Field] = DepNameData.join(",");
            UserExist[User_Roll_Admin] = Role_Admin_Data ? (Role_Admin_Data.rollDescrption ? JSON.parse(Role_Admin_Data.rollDescrption).join(',') : null) : null;
        }



        await UserExist.save();
    }

    res.status(200).json({
        status: 'success',
        data: "Data added successfully",
    });
});

const deleteUserData = asyncHandler(async (req, res) => {
    const { deleteType, roleId, userId } = req.body;

    if (deleteType == 1) {
        // Delete entire user
        const deletedUser = await faculties.destroy({
            where: { Eva_Id: userId }
        });
        if (!deletedUser) {
            throw new AppError('Failed to delete user', 500);
        }
        res.status(200).json({
            status: 'success',
            message: 'User deleted successfully',
        });
    } else if (deleteType == 2) {
        // Delete specific role from user
        const user = await faculties.findOne({ where: { Eva_Id: userId } });
        if (!user) {
            throw new AppError('User not found', 404);
        }
        let roles = user.Role ? user.Role.split(',') : [];
        roles = roles.filter(role => role !== roleId);
        user.Role = roles.join(',');
        await user.save();
        res.status(200).json({
            status: 'success',
            message: 'Role removed from user successfully',
        });
    } else {
        throw new AppError('Invalid delete type', 400);
    }
});

const addUpdateSubjectData = asyncHandler(async (req, res) => {
    const {
        Subject_Code,
        Evaluation_Type,
        Camp_Id,
        Camp_Officer_Id,
        Total_Paper_In_Each_Subject,
        Dep_Name,
        Examiner_Valuation_Status,
        Eva_Id,
        id,
        mode,
        selectedRole,
        chief_examiner
    } = req.body;
    console.log('Received Subject Data:', req.body); // Debug log to check incoming data

    const index = id;
    let Dep_Name_Field = `Dep_Name_${selectedRole}`;
    const user = await faculties.findOne({ where: { Eva_Id: Eva_Id } });
    // if (!user) {
    //     throw new AppError('User not found', 404);
    // }
    let subcode = user.subcode ? user.subcode.split(",") : [];
    let Eva_Subject = user.Eva_Subject ? user.Eva_Subject.split(",") : [];
    let Camp_id = user.Camp_id ? user.Camp_id.split(",") : [];
    let camp_offcer_id_examiner = user.camp_offcer_id_examiner ? user.camp_offcer_id_examiner.split(",") : [];
    let Sub_Max_Paper = user.Sub_Max_Paper ? user.Sub_Max_Paper.split(",") : [];
    let Valuation_Status = user.Examiner_Valuation_Status ? user.Examiner_Valuation_Status.split(",") : [];
    let Dep_Code = user[Dep_Name_Field] ? user[Dep_Name_Field].split(",") : [];
    let Chief_subcode = user.Chief_subcode ? user.Chief_subcode.split(",") : [];
    let Chief_Eva_Subject = user.Chief_Eva_Subject ? user.Chief_Eva_Subject.split(",") : [];
    let Camp_id_chief = user.Camp_id_chief ? user.Camp_id_chief.split(",") : [];
    let camp_offcer_id_chief = user.camp_offcer_id_chief ? user.camp_offcer_id_chief.split(",") : [];
    let Chief_Valuation_Status = user.Chief_Valuation_Status ? user.Chief_Valuation_Status.split(",") : [];
    let chief_examiner_tbl = user.chief_examiner ? user.chief_examiner.split(",") : [];
    console.log('User Found for Subject Update:', user); // Debug log to confirm user retrieval

    let evaluationSubjectsArray = [];
    let chiefExaminerSubjectsArray = [];

    for (let i = 0; i < subcode.length; i++) {

        evaluationSubjectsArray.push({
            sub_code: subcode[i],
            Camp_id: Camp_id[i],
            camp_offcer_id_examiner: camp_offcer_id_examiner[i],
            Sub_Max_Paper: Sub_Max_Paper[i],
            Eva_Subject: Eva_Subject[i],
            Dep_Code: Dep_Code[i]
        });
    }

    for (let i = 0; i < Chief_subcode.length; i++) {

        chiefExaminerSubjectsArray.push({
            sub_code: Chief_subcode[i],
            Camp_id: Camp_id_chief[i],
            camp_offcer_id_chief: camp_offcer_id_chief[i],
            Chief_Eva_Subject: Chief_Eva_Subject[i],
            Dep_Code: Dep_Code[i],
            chief_examiner: chief_examiner_tbl[i]
        });
    }

    console.log('Chief Examiner Subjects Array:', chiefExaminerSubjectsArray); // Debug log to check chief examiner subjects array
    //return


    if (selectedRole === '1') {

        if (mode === 'add') {

            if (Chief_subcode.includes(Subject_Code) && Chief_Eva_Subject.includes(Evaluation_Type) && chief_examiner_tbl.includes(chief_examiner)) {
                throw new AppError('Subject already exists for the user', 400);
            }
            console.log('Adding new chief subject with code:', Subject_Code);
            Chief_subcode.push(Subject_Code);
            Chief_Eva_Subject.push(Evaluation_Type);
            Camp_id_chief.push(Camp_Id);
            camp_offcer_id_chief.push(Camp_Officer_Id);
            Chief_Valuation_Status.push(Examiner_Valuation_Status);
            chief_examiner_tbl.push(chief_examiner);
            Dep_Code.push(Dep_Name);
            user.Chief_subcode = Chief_subcode.join(",");
            user.Chief_Eva_Subject = Chief_Eva_Subject.join(",");
            user.Camp_id_chief = Camp_id_chief.join(",");
            user.camp_offcer_id_chief = camp_offcer_id_chief.join(",");
            user.Chief_Valuation_Status = Chief_Valuation_Status.join(",");
            user.chief_examiner = chief_examiner_tbl.join(",");
            user[Dep_Name_Field] = Dep_Code.join(",");
            await user.save();
        } else if (mode === 'edit') {
            if (index === -1) {
                throw new AppError('Subject not found for the user', 404);
            }
            if (Chief_subcode[index] == Subject_Code && Chief_Eva_Subject[index] == Evaluation_Type && Camp_id_chief[index] == Camp_Id && camp_offcer_id_chief[index] == Camp_Officer_Id && Chief_Valuation_Status[index] == Examiner_Valuation_Status && chief_examiner_tbl[index] == chief_examiner) {

                throw new AppError('Subject code already exists for the user', 400);

            }

            if (Chief_subcode[index] !== Subject_Code) {
                if (Chief_subcode.includes(Subject_Code) && chief_examiner_tbl.includes(chief_examiner) && Evaluation_Type == Chief_Eva_Subject[index]) {
                    throw new AppError('Subject code already exists for the user in the same evaluation type', 400);
                }
            }

            Chief_subcode[index] = Subject_Code;
            Chief_Eva_Subject[index] = Evaluation_Type;
            Camp_id_chief[index] = Camp_Id;
            camp_offcer_id_chief[index] = Camp_Officer_Id;
            Chief_Valuation_Status[index] = Examiner_Valuation_Status;
            chief_examiner_tbl[index] = chief_examiner;
            console.log('Testing ', Chief_subcode)
            user.Chief_subcode = Chief_subcode.join(",");
            user.Chief_Eva_Subject = Chief_Eva_Subject.join(",");
            user.Camp_id_chief = Camp_id_chief.join(",");
            user.camp_offcer_id_chief = camp_offcer_id_chief.join(",");
            user.Chief_Valuation_Status = Chief_Valuation_Status.join(",");
            user.chief_examiner = chief_examiner_tbl.join(",");
            user[Dep_Name_Field] = Dep_Code.join(",");
            await user.save();

        } else if (mode === 'delete') {

 

            console.log('Chief Examiner Subjects Array:', chiefExaminerSubjectsArray); // Debug log to check chief examiner subjects array

            let index = chiefExaminerSubjectsArray.findIndex(item => item.sub_code === Subject_Code && item.Chief_Eva_Subject === Evaluation_Type && item.chief_examiner === chief_examiner);
            if (index === -1) {
                throw new AppError('Subject not found for the user', 404);
            }
            console.log('Deleting Chief Subject at index:', index); // Debug log to check index being deleted
            Chief_subcode.splice(index, 1);
            Chief_Eva_Subject.splice(index, 1);
            Camp_id_chief.splice(index, 1);
            camp_offcer_id_chief.splice(index, 1);
            Chief_Valuation_Status.splice(index, 1);
            chief_examiner_tbl.splice(index, 1);
            Dep_Code.splice(index, 1);
            user.Chief_subcode = Chief_subcode.join(",");
            user.Chief_Eva_Subject = Chief_Eva_Subject.join(",");
            user.Camp_id_chief = Camp_id_chief.join(",");
            user.camp_offcer_id_chief = camp_offcer_id_chief.join(",");
            user.Chief_Valuation_Status = Chief_Valuation_Status.join(",");
            user.chief_examiner = chief_examiner_tbl.join(",");
            user[Dep_Name_Field] = Dep_Code.join(",");
            await user.save();
        }
    } else if (selectedRole === '2') {
        if (mode === 'add') {

            if (subcode.includes(Subject_Code) && Eva_Subject.includes(Evaluation_Type)) {
                throw new AppError('Subject already exists for the user', 400);
            }
            console.log('Adding new subject with code:', Subject_Code); // Debug log to check subject code being added
            subcode.push(Subject_Code);
            Eva_Subject.push(Evaluation_Type);
            Camp_id.push(Camp_Id);
            camp_offcer_id_examiner.push(Camp_Officer_Id);
            Sub_Max_Paper.push(Total_Paper_In_Each_Subject);
            Valuation_Status.push(Examiner_Valuation_Status);
            Dep_Code.push(Dep_Name);
            user.subcode = subcode.join(",");
            user.Eva_Subject = Eva_Subject.join(",");
            user.Camp_id = Camp_id.join(",");
            user.camp_offcer_id_examiner = camp_offcer_id_examiner.join(",");
            user.Sub_Max_Paper = Sub_Max_Paper.join(",");
            user.Examiner_Valuation_Status = Valuation_Status.join(",");
            user[Dep_Name_Field] = Dep_Code.join(",");
            await user.save();

        } else if (mode === 'edit') {

            if (index === -1) {
                throw new AppError('Subject not found for the user', 404);
            }
            if (subcode[index] == Subject_Code && Eva_Subject[index] == Evaluation_Type && Camp_id[index] == Camp_Id && camp_offcer_id_examiner[index] == Camp_Officer_Id && Sub_Max_Paper[index] == Total_Paper_In_Each_Subject && Valuation_Status[index] == Examiner_Valuation_Status && Dep_Code[index] == Dep_Name) {

                throw new AppError('Subject code already exists for the user', 400);

            }

            if (subcode[index] !== Subject_Code) {
                if (subcode.includes(Subject_Code) && Evaluation_Type == Eva_Subject[index]) {
                    throw new AppError('Subject code already exists for the user in the same evaluation type', 400);
                }
            }

            console.log('Editing Subject at index:', index); // Debug log to check index
            subcode[index] = Subject_Code;
            Eva_Subject[index] = Evaluation_Type;
            Camp_id[index] = Camp_Id;
            camp_offcer_id_examiner[index] = Camp_Officer_Id;
            Sub_Max_Paper[index] = Total_Paper_In_Each_Subject;
            Valuation_Status[index] = Examiner_Valuation_Status;
            Dep_Code[index] = Dep_Name;
            console.log('Testing ', subcode)
            user.subcode = subcode.join(",");
            user.Eva_Subject = Eva_Subject.join(",");
            user.Camp_id = Camp_id.join(",");
            user.camp_offcer_id_examiner = camp_offcer_id_examiner.join(",");
            user.Sub_Max_Paper = Sub_Max_Paper.join(",");
            user.Examiner_Valuation_Status = Valuation_Status.join(",");
            user[Dep_Name_Field] = Dep_Code.join(",");
            await user.save();
        } else if (mode === 'delete') {
            // if (index === undefined || index === null || index < 0) {
            //     throw new AppError('Invalid index for delete', 400);
            // }
        
            let index = evaluationSubjectsArray.findIndex(item => item.sub_code === Subject_Code && item.Eva_Subject === Evaluation_Type);
            if (index === -1) {
                throw new AppError('Subject not found for the user', 404);
            }
            subcode.splice(index, 1);
            Eva_Subject.splice(index, 1);
            Camp_id.splice(index, 1);
            camp_offcer_id_examiner.splice(index, 1);
            Sub_Max_Paper.splice(index, 1);
            Valuation_Status.splice(index, 1);
            Dep_Code.splice(index, 1);
            user.subcode = subcode.join(",");
            user.Eva_Subject = Eva_Subject.join(",");
            user.Camp_id = Camp_id.join(",");
            user.camp_offcer_id_examiner = camp_offcer_id_examiner.join(",");
            user.Sub_Max_Paper = Sub_Max_Paper.join(",");
            user.Examiner_Valuation_Status = Valuation_Status.join(",");
            user[Dep_Name_Field] = Dep_Code.join(",");
            await user.save();
        }
    }

    res.status(200).json({
        status: 'success',
        message: 'Subject data updated successfully',
    });

});


const updateGeneralBioData = asyncHandler(async (req, res) => {

    const {
        Eva_Id,
        FACULTY_NAME,
        Email_Id,
        Mobile_Number,
        Role,
        Max_Paper,
        id,
    } = req.body;
    const user = await faculties.findByPk(id);
    if (user) {
        user.FACULTY_NAME = FACULTY_NAME;
        user.Email_Id = Email_Id;
        user.Mobile_Number = Mobile_Number;
        user.Max_Paper = Role === "2" ? Max_Paper : user.Max_Paper; // Update Max_Paper only for Examiners
        user.Camp_id_Camp = Role === "4" ? req.body.Camp_id_Camp : user.Camp_id_Camp; // Update Camp_id_Camp only for Camp Officers
        await user.save();
    } else {
        throw new AppError('User not found', 404);
    }

    res.status(200).json({
        status: 'success',
        message: 'General bio data updated successfully',
    });



})

const getAllUserDataError = asyncHandler(async (req, res) => {
    const faculties_Data = await faculties.findAll({
        where: { vflg: '1' }
    });
    if (!faculties_Data) {
        throw new AppError('No user data found', 404);
    }
    res.status(200).json({
        status: 'success',
        data: faculties_Data,
    });
});

const updateFacultyRawFields = asyncHandler(async (req, res) => {
    const { id, ...fields } = req.body;

    const user = await faculties.findByPk(id);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    const allowedFields = [
        'subcode', 'Eva_Subject', 'Sub_Max_Paper', 'camp_offcer_id_examiner',
        'Camp_id', 'Examiner_Valuation_Status', 'Dep_Name_2',
        'Chief_subcode', 'Chief_Eva_Subject', 'chief_examiner',
        'camp_offcer_id_chief', 'Camp_id_chief', 'Chief_Valuation_Status', 'Dep_Name_1'
    ];

    allowedFields.forEach(f => {
        if (fields[f] !== undefined) user[f] = fields[f];
    });

    // Reset vflg after manual fix so it can be re-checked
    user.vflg = '0';
    user.Remarks_Gen = null;

    await user.save();

    res.status(200).json({
        status: 'success',
        message: 'Faculty fields updated successfully',
    });
});

const getAllUserRollData = asyncHandler(async (req, res) => {

    // Fetch faculty data with only necessary fields for role allocation
    const AllFacultyData = await faculties.findAll({
        attributes: [
            'id',
            'Eva_Id',
            'FACULTY_NAME',
            'Role',
            'Email_Id',
            'Mobile_Number',
            'Dep_Name_1',
            'Dep_Name_2',
            'Dep_Name_3',
            'Dep_Name_4',
            'Dep_Name_5'
        ],
        order: [['FACULTY_NAME', 'ASC']]
    });

    const NavbarDataDetails = await db.navbar_header.findAll({
        order: [
            ['Nav_Header_1', 'ASC'],
            ['Nav_Header_2', 'ASC']
        ]
    });

    const MainHeaderData = NavbarDataDetails.filter(item => item.Nav_Header_2 == '0');

    if (!NavbarDataDetails) {
        throw new AppError('No navbar data found', 404);
    }

    res.status(200).json({
        status: 'success',
        data_header: MainHeaderData,
        data_complete: NavbarDataDetails,
        FacultyDetails: AllFacultyData
    });
});

const createNavbarItem = asyncHandler(async (req, res) => {
    const {
        Nav_Main_Header_Name,
        Nav_Main_Header_Name_Description,
        Nav_Header_1,
        Nav_Header_2,
        Nav_Header_3,
        Nav_Header_4,
        user_Type,
        user_Role,
        Nav_Status,
        Nav_Icons,
        route_path
    } = req.body;

    if (!Nav_Main_Header_Name || Nav_Main_Header_Name.trim() === '') {
        throw new AppError('Navigation name is required', 400);
    }

    const newNavbarItem = await db.navbar_header.create({
        Nav_Main_Header_Name,
        Nav_Main_Header_Name_Description: Nav_Main_Header_Name_Description || '',
        Nav_Header_1: Nav_Header_1 || 0,
        Nav_Header_2: Nav_Header_2 || 0,
        Nav_Header_3: Nav_Header_3 || 0,
        Nav_Header_4: Nav_Header_4 || 0,
        user_Type: user_Type || 1,
        user_Role: user_Role || '0',
        Nav_Status: Nav_Status !== undefined ? Nav_Status : 1,
        Nav_Icons: Nav_Icons || null,
        route_path: route_path || null
    });

    res.status(201).json({
        status: 'success',
        message: 'Navbar item created successfully',
        data: newNavbarItem
    });
});

const updateNavbarItem = asyncHandler(async (req, res) => {
    const {
        id,
        Nav_Main_Header_Name,
        Nav_Main_Header_Name_Description,
        Nav_Header_1,
        Nav_Header_2,
        Nav_Header_3,
        Nav_Header_4,
        user_Type,
        user_Role,
        Nav_Status,
        Nav_Icons,
        route_path
    } = req.body;

    if (!id) {
        throw new AppError('Navbar item ID is required', 400);
    }

    const navbarItem = await db.navbar_header.findByPk(id);
    if (!navbarItem) {
        throw new AppError('Navbar item not found', 404);
    }

    if (!Nav_Main_Header_Name || Nav_Main_Header_Name.trim() === '') {
        throw new AppError('Navigation name is required', 400);
    }

    navbarItem.Nav_Main_Header_Name = Nav_Main_Header_Name;
    navbarItem.Nav_Main_Header_Name_Description = Nav_Main_Header_Name_Description || '';
    navbarItem.Nav_Header_1 = Nav_Header_1 || 0;
    navbarItem.Nav_Header_2 = Nav_Header_2 || 0;
    navbarItem.Nav_Header_3 = Nav_Header_3 || 0;
    navbarItem.Nav_Header_4 = Nav_Header_4 || 0;
    navbarItem.user_Type = user_Type || '0';
    navbarItem.user_Role = user_Role || '0';
    navbarItem.Nav_Status = Nav_Status || 0;
    navbarItem.Nav_Icons = Nav_Icons || null;
    navbarItem.route_path = route_path || null;

    await navbarItem.save();

    res.status(200).json({
        status: 'success',
        message: 'Navbar item updated successfully',
        data: navbarItem
    });
});

const deleteNavbarItem = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        throw new AppError('Navbar item ID is required', 400);
    }

    const navbarItem = await db.navbar_header.findByPk(id);
    if (!navbarItem) {
        throw new AppError('Navbar item not found', 404);
    }

    await navbarItem.destroy();

    res.status(200).json({
        status: 'success',
        message: 'Navbar item deleted successfully'
    });
});

// Roll Master CRUD Operations
const getAllRollMasters = asyncHandler(async (req, res) => {
    const rollMasters = await db.roll_master.findAll({
        order: [['id', 'ASC']]
    });

    // Get navbar headers where user_Role is 0
    const navbarHeaders = await db.navbar_header.findAll({
        where: {
            user_Role: '0'
        },
        order: [['Nav_Header_1', 'ASC'], ['Nav_Header_2', 'ASC']]
    });

    res.status(200).json({
        status: 'success',
        rollMasters: rollMasters,
        navbarHeaders: navbarHeaders
    });
});

const createRollMaster = asyncHandler(async (req, res) => {
    const { rollName, rollDescrption, rollStatus } = req.body;

    console.log('Creating Roll Master with data:', req.body); // Debug log to check incoming data

    if (rollName === undefined || rollName === null || rollName === '') {
        throw new AppError('Roll name is required', 400);
    }

    // Parse the array from rollDescrption: [navHeader1, ...navHeader2IDs]
    let parsedArray;
    try {
        parsedArray = JSON.parse(rollDescrption || '[]');
    } catch (error) {
        throw new AppError('Invalid rollDescrption format', 400);
    }

    if (!Array.isArray(parsedArray) || parsedArray.length === 0) {
        throw new AppError('Invalid rollDescrption format', 400);
    }

    // Extract navHeader1 (first element) and navHeader2 (remaining elements)
    const navHeader1 = parsedArray[0];
    const selectedHeaderIds = parsedArray.slice(1);

    if (!navHeader1) {
        throw new AppError('Main Header Level 1 is required', 400);
    }

    if (selectedHeaderIds.length === 0) {
        throw new AppError('At least one navbar header must be selected', 400);
    }

    // Check if a roll master with the same rollName already exists
    const existingRollMaster = await db.roll_master.findOne({
        where: {
            rollName
        }
    });

    if (existingRollMaster) {
        // Append to existing rollDescrption array without duplicates
        try {
            const existingArray = JSON.parse(existingRollMaster.rollDescrption || '[]');
            if (Array.isArray(existingArray)) {
                // Merge arrays and remove duplicates
                const mergedArray = [...new Set([...existingArray, ...parsedArray])];
                existingRollMaster.rollDescrption = JSON.stringify(mergedArray);
                existingRollMaster.rollStatus = rollStatus !== undefined ? rollStatus : existingRollMaster.rollStatus;
                await existingRollMaster.save();

                res.status(200).json({
                    status: 'success',
                    message: 'Roll master updated - navbar headers appended successfully',
                    data: existingRollMaster
                });
                return;
            }
        } catch (error) {
            throw new AppError('Error merging navbar headers', 500);
        }
    }

    const newRollMaster = await db.roll_master.create({
        rollName,
        rollDescrption: rollDescrption || '',
        rollStatus: rollStatus !== undefined ? rollStatus : 1
    });

    res.status(201).json({
        status: 'success',
        message: 'Roll master created successfully',
        data: newRollMaster
    });
});

const updateRollMaster_Final = asyncHandler(async (req, res) => {
    const { id, rollName, rollDescrption, rollStatus } = req.body;


    console.log('Updating Roll Master with data 11:', req.body); // Debug log to check incoming data
    

    if (!id) {
        throw new AppError('Roll master ID is required', 400);
    }

    const rollMaster = await db.roll_master.findByPk(id);
    if (!rollMaster) {
        throw new AppError('Roll master not found', 404);
    }

    console.log('Found Roll Master:', rollMaster); // Debug log to confirm roll master retrieval
    if (rollName === undefined || rollName === null || rollName === '') {
        throw new AppError('Roll name is required', 400);
    }

    // Parse the array from rollDescrption: [navHeader1, ...navHeader2IDs]
    let parsedArray;
    try {
        parsedArray = JSON.parse(rollDescrption || '[]');
    } catch (error) {
        throw new AppError('Invalid rollDescrption format', 400);
    }

    if (!Array.isArray(parsedArray) || parsedArray.length === 0) {
        throw new AppError('Invalid rollDescrption format', 400);
    }

    // Extract navHeader1 (first element) and navHeader2 (remaining elements)
    const navHeader1 = parsedArray[0];
    const selectedHeaderIds = parsedArray.slice(1);

    if (!navHeader1) {
        throw new AppError('Main Header Level 1 is required', 400);
    }

    if (selectedHeaderIds.length === 0) {
        throw new AppError('At least one navbar header must be selected', 400);
    }

    // Check if another roll master with the same rollName exists (excluding current record)
    const existingRollMaster = await db.roll_master.findOne({
        where: {
            rollName,
            id: { [Op.ne]: id } // Exclude the current record being updated
        }
    });

    console.log('Existing Roll Master with same rollName:', existingRollMaster); // Debug log to check for existing roll master with same name

    if (existingRollMaster) {
        // Merge with existing record
        try {
            const existingArray = JSON.parse(existingRollMaster.rollDescrption || '[]');
            if (Array.isArray(existingArray)) {
                // Merge arrays and remove duplicates
                const mergedArray = [...new Set([...existingArray, ...parsedArray])];
                existingRollMaster.rollDescrption = JSON.stringify(mergedArray);
                existingRollMaster.rollStatus = rollStatus !== undefined ? rollStatus : existingRollMaster.rollStatus;
                await existingRollMaster.save();

                // Delete the current record since we merged it into existing one
                await rollMaster.destroy();

                res.status(200).json({
                    status: 'success',
                    message: 'Roll master merged - navbar headers appended successfully',
                    data: existingRollMaster
                });
                return;
            }
        } catch (error) {
            throw new AppError('Error merging navbar headers', 500);
        }
    }

    console.log('Updating Roll Master with new data:', { rollName, rollDescrption, rollStatus }); // Debug log to check new data being updated
    // Merge new data with existing rollDescrption array to avoid duplicates
    let finalRollDescrption;
    try {
        const currentArray = JSON.parse(rollMaster.rollDescrption || '[]');
        if (Array.isArray(currentArray) && currentArray.length > 0) {
            // Merge current array with new array and remove duplicates
            const mergedArray = [...new Set([...currentArray, ...parsedArray])];
            finalRollDescrption = JSON.stringify(mergedArray);
            console.log('Merged rollDescrption (removed duplicates):', finalRollDescrption);
        } else {
            finalRollDescrption = rollDescrption || '';
        }
    } catch (error) {
        finalRollDescrption = rollDescrption || '';
    }

    console.log('Final rollDescrption to be saved:', finalRollDescrption); // Debug log to check final rollDescrption
    rollMaster.rollName = rollName;
    //rollMaster.rollDescrption = finalRollDescrption;
    rollMaster.rollDescrption = rollDescrption || '';
    rollMaster.rollStatus = rollStatus !== undefined ? rollStatus : rollMaster.rollStatus;

    await rollMaster.save();

    res.status(200).json({
        status: 'success',
        message: 'Roll master updated successfully',
        data: rollMaster
    });
});

const deleteRollMaster = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        throw new AppError('Roll master ID is required', 400);
    }

    const rollMaster = await db.roll_master.findByPk(id);
    if (!rollMaster) {
        throw new AppError('Roll master not found', 404);
    }

    await rollMaster.destroy();

    res.status(200).json({
        status: 'success',
        message: 'Roll master deleted successfully'
    });
});

// Update User Roll Admin - Assign Navbar items to user
const updateUserRollAdmin = asyncHandler(async (req, res) => {
    const { userId, evaId, userRollAdmin, roleColumn } = req.body;

    console.log('Updating User Roll Admin with data:', req.body); // Debug log to check incoming data

    if (!userId && !evaId) {
        throw new AppError('User ID or Eva ID is required', 400);
    }

    // Determine which role column to update (default to User_Roll_Admin if not specified)
    const fieldName = roleColumn !== undefined ? `User_Roll_Admin_${roleColumn}` : 'User_Roll_Admin';
    console.log(`Updating field: ${fieldName}`);

    // Find user by either id or Eva_Id
    const whereClause = userId ? { id: userId } : { Eva_Id: evaId };
    const user = await faculties.findOne({ where: whereClause });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Update the specific User_Roll_Admin field
    const updateData = {
        [fieldName]: userRollAdmin
    };
    
    await user.update(updateData);

    res.status(200).json({
        success: true,
        message: `${fieldName} updated successfully`,
        data: {
            id: user.id,
            Eva_Id: user.Eva_Id,
            FACULTY_NAME: user.FACULTY_NAME,
            [fieldName]: user[fieldName]
        }
    });
});

const UpdaterollMaster = asyncHandler(async (req, res) => {

const { ExaminerRoll } = req.body;

    console.log('Processing Roll Master with data 1:', ExaminerRoll); // Debug log to check incoming data
    
    // Validate that ExaminerRoll is an array
    if (!ExaminerRoll || !Array.isArray(ExaminerRoll)) {
        throw new AppError('ExaminerRoll must be an array', 400);
    }
    
    if (ExaminerRoll.length === 0) {
        throw new AppError('ExaminerRoll cannot be empty', 400);
    }

    for (const item of ExaminerRoll) {
        let RollData = item.Role ? item.Role.split(",") : [];
        console.log('Processing item with roles:', RollData); // Debug log to check current item being processed
       
        
        for (let i = 0; i < RollData.length; i++) {
            const roleId = RollData[i].trim();
             let flnameRollMaster = "User_Roll_Admin_" + roleId;
            
            if (roleId === '') {
                throw new AppError('Invalid role: empty values are not allowed', 400);
            }
            
            const rollName = parseInt(roleId);
            console.log('Processing rollName:', rollName, 'for user:', item.Eva_Id);
            
            const existingRollMaster = await db.roll_master.findOne({
                where: {
                    rollName: rollName
                }
            });

            console.log('Existing Roll Master:', existingRollMaster); // Debug log to check existing roll master
            
            if (existingRollMaster) {
                try {
                    const existingArray = JSON.parse(existingRollMaster.rollDescrption || '[]');
                   // const facultyArray = item.User_Roll_Admin ? item.User_Roll_Admin.split(",").map(item => item.trim()) : [];

                    // Merge both arrays and create unique values
                  //  const mergedArray = [...new Set([...existingArray, ...facultyArray])];
                   const mergedArray = [...new Set([...existingArray])];

                   console.log('Merged array for rollName:', rollName, 'is:', mergedArray.join(",")); // Debug log to check merged array
                 
                    
                    // Update the roll master with merged unique values
                    // existingRollMaster.rollDescrption = JSON.stringify(mergedArray);
                    // existingRollMaster.rollStatus = 1;
                    // await existingRollMaster.save();
                    
                    // Update the faculty User_Roll_Admin field
                    const [updateCount] = await faculties.update(
                        { [flnameRollMaster]: mergedArray.join(",") },
                        { where: { Eva_Id: item.Eva_Id } }
                    );
                    
                    if (updateCount === 0) {
                        console.warn(`No faculty updated for Eva_Id: ${item.Eva_Id}, field: ${flnameRollMaster}`);
                    }

                        // return

                    console.log('Updated roll master for rollName:', rollName, 'with merged array:', mergedArray);
                } catch (error) {
                    console.error('Error merging navbar headers:', error);
                    throw new AppError('Error merging navbar headers: ' + error.message, 500);
                }
            } else {
                // // Create new roll master if doesn't exist
                // try {
                //     const facultyArray = item.User_Roll_Admin ? item.User_Roll_Admin.split(",").map(item => item.trim()) : [];
                //     const uniqueArray = [...new Set(facultyArray)];
                    
                //     await db.roll_master.create({
                //         rollName: rollName,
                //         rollDescrption: JSON.stringify(uniqueArray),
                //         rollStatus: 1
                //     });
                    
                //     console.log('Created new roll master for rollName:', rollName, 'with unique array:', uniqueArray);
                // } catch (error) {
                //     console.error('Error creating roll master:', error);
                //     throw new AppError('Error creating roll master: ' + error.message, 500);
                // }
            }
            console.log('Finished processing rollName:', rollName); // Debug log to check after processing each role
        }
    }

    res.status(201).json({
        status: 'success',
        message: 'Roll master processed successfully'
    });
});

module.exports = {
    getAllUserData,
    createUserData,
    deleteUserData,
    addUpdateSubjectData,
    updateGeneralBioData,
    getAllUserDataError,
    updateFacultyRawFields,
    getAllUserRollData,
    createNavbarItem,
    updateNavbarItem,
    deleteNavbarItem,
    getAllRollMasters,
    createRollMaster,
    updateRollMaster_Final,
    deleteRollMaster,
    updateUserRollAdmin,
    UpdaterollMaster
};
