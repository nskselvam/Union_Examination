'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('valuation_payment_master', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Report_I_Date: {
        type: Sequelize.STRING(25),
        allowNull: true
      },
      Report_E_Data: {
        type: Sequelize.STRING(25),
        allowNull: true
      },
      Evaluation_Id: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      Evaluation_Name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      Camp_Id: {
        type: Sequelize.STRING(25),
        allowNull: true
      },
      Camp_Officer_Id: {
        type: Sequelize.STRING(25),
        allowNull: true
      },
      Camp_Officer_Name: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      Examiner_Type: {
        type: Sequelize.STRING(1),
        allowNull: true
      },
      Subject_Amount: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      Extra_Amount: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      Chief_Day_Amount: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      Chief_Max_Paper_Amount: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      Total_Amount: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      Additional_Amount: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      chief_Evaluated_Day: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      chief_Subcode_Evaluated_Script: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      chief_Examiner_Evaluated_Script: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      examiner_Subcode: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      examiner_Evaluator: {
        type: Sequelize.STRING(25),
        allowNull: true
      },
      subcode_Amt: {
        type: Sequelize.STRING(25),
        allowNull: true
      },
    
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('valuation_payment_master');
  }
};
