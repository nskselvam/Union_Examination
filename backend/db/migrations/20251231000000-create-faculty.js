'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('faculties', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Dep_Name: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      Eva_Id: {
        type: Sequelize.STRING(25)
      },
      FACULTY_NAME: {
        type: Sequelize.STRING(200)
      },
      Password: {
        type: Sequelize.STRING(200)
      },
      Role: {
        type: Sequelize.STRING(15)
      },
      chief_examiner: {
        type: Sequelize.STRING(500)
      },
      Eva_ctrl: {
        type: Sequelize.STRING(250)
      },
      LoginDate: {
        type: Sequelize.STRING(50)
      },
      InTime: {
        type: Sequelize.STRING(20)
      },
      OutTime: {
        type: Sequelize.STRING(20)
      },
      ResetPass: {
        type: Sequelize.STRING(20)
      },
      Checking: {
        type: Sequelize.STRING(10)
      },
      subcode: {
        type: Sequelize.STRING(500)
      },
      reg_date: {
        type: Sequelize.STRING(100)
      },
      vflg: {
        type: Sequelize.INTEGER
      },
      FP: {
        type: Sequelize.STRING(100)
      },
      mac: {
        type: Sequelize.STRING(50)
      },
      EvaFromDate: {
        type: Sequelize.STRING(100)
      },
      EvaToDate: {
        type: Sequelize.STRING(100)
      },
      Session_Cnt: {
        type: Sequelize.STRING(5)
      },
      insflg: {
        type: Sequelize.STRING(15)
      },
      FLG: {
        type: Sequelize.STRING(10)
      },
      Eva_Subject: {
        type: Sequelize.STRING(500)
      },
      Eva_Mon_Year: {
        type: Sequelize.STRING(50)
      },
      Max_Paper: {
        type: Sequelize.STRING(25)
      },
      Sub_Max_Paper: {
        type: Sequelize.STRING(500)
      },
      Temp_Password: {
        type: Sequelize.STRING(250)
      },
      Mobile_Number: {
        type: Sequelize.STRING(25)
      },
      Sms_Status: {
        type: Sequelize.STRING(25)
      },
      Chief_Name: {
        type: Sequelize.STRING(250)
      },
      Email_Id: {
        type: Sequelize.STRING(250)
      },
      New_Flg: {
        type: Sequelize.STRING(10)
      },
      terms: {
        type: Sequelize.STRING(50)
      },
      Active_Status: {
        type: Sequelize.STRING(1)
      },
      Chief_subcode: {
        type: Sequelize.STRING(500)
      },
      Chief_Eva_Subject: {
        type: Sequelize.STRING(500)
      },
      Reviewer_examiner: {
        type: Sequelize.STRING(500)
      },
      Reviewer_subcode: {
        type: Sequelize.STRING(500)
      },
      Reviewer_Eva_Subject: {
        type: Sequelize.STRING(500)
      },
      disable_status: {
        type: Sequelize.STRING(250)
      },
      camp_offcer_id: {
        type: Sequelize.STRING(250)
      },
      Import_Date: {
        type: Sequelize.STRING(255)
      },
      camp_offcer_id_examiner: {
        type: Sequelize.STRING(500)
      },
      Camp_id: {
        type: Sequelize.STRING(500)
      },
      camp_offcer_id_chief: {
        type: Sequelize.STRING(500)
      },
      Camp_id_chief: {
        type: Sequelize.STRING(500)
      },
      servername: {
        type: Sequelize.STRING(250)
      },
      Examiner_Valuation_Status: {
        type: Sequelize.STRING(255)
      },
      Chief_Valuation_Status: {
        type: Sequelize.STRING(255)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('faculties');
  }
};
