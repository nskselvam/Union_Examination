'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mcq_Answers_Master', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Qst_Number: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      Qst_Ans: {
        type: Sequelize.STRING(5),
        allowNull: true
      },
      Qst_Remarks: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      Eva_Id: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      Subcode: {
        type: Sequelize.STRING(25),
        allowNull: true
      },
      SubName: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      Dep_Name: {
        type: Sequelize.STRING(5),
        allowNull: true
      },
      Eva_Month: {
        type: Sequelize.STRING(25),
        allowNull: true
      },
      Upload_Date: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      Updated_Flg: {
        type: Sequelize.STRING(1),
        allowNull: true
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('mcq_Answers_Master');
  }
};
