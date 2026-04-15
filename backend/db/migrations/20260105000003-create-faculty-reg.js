'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('faculty_reg', {
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
        type: Sequelize.STRING(25),
        allowNull: true
      },
      FACULTY_NAME: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      Password: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      Role: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      chief_examiner: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      Eva_ctrl: {
        type: Sequelize.STRING(250),
        allowNull: true
      },
      LoginDate: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      InTime: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      OutTime: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      ResetPass: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      Checking: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      subcode: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      reg_date: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      vflg: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      FP: {
        type: Sequelize.BLOB('medium'),
        allowNull: true
      },
      mac: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      EvaFromDate: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      EvaToDate: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      Session_Cnt: {
        type: Sequelize.STRING(5),
        allowNull: true
      },
      insflg: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      FLG: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      Eva_Subject: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      Eva_Mon_Year: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      Max_Paper: {
        type: Sequelize.STRING(25),
        allowNull: true
      },
      Sub_Max_Paper: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      Temp_Password: {
        type: Sequelize.STRING(250),
        allowNull: true
      },
      Mobile_Number: {
        type: Sequelize.STRING(25),
        allowNull: true
      },
      Sms_Status: {
        type: Sequelize.STRING(25),
        allowNull: true
      },
      Chief_Name: {
        type: Sequelize.STRING(250),
        allowNull: true
      },
      Email_Id: {
        type: Sequelize.STRING(250),
        allowNull: true
      },
      New_Flg: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      terms: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      Active_Status: {
        type: Sequelize.STRING(1),
        allowNull: true
      },
      Chief_subcode: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      Chief_Eva_Subject: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      Reviewer_examiner: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      Reviewer_subcode: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      Reviewer_Eva_Subject: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      disable_status: {
        type: Sequelize.STRING(250),
        allowNull: true
      },
      camp_offcer_id: {
        type: Sequelize.STRING(250),
        allowNull: true
      },
      Import_Date: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      camp_offcer_id_examiner: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      Camp_id: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      camp_offcer_id_chief: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      Camp_id_chief: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      servername: {
        type: Sequelize.STRING(250),
        allowNull: true
      },
      Examiner_Valuation_Status: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      Chief_Valuation_Status: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add index
    await queryInterface.addIndex('faculty_reg', ['Eva_Id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('faculty_reg');
  }
};
