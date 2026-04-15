'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sub_master', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Subcode: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      SUBNAME: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      Dep_Name: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      Rate_Per_Script: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      Min_Amount: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      MARKS_FOR: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      cnt: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      Valcnt: {
        type: Sequelize.STRING(2),
        allowNull: false
      },
      Mark_Diff: {
        type: Sequelize.STRING(25),
        allowNull: true
      },
      diff_flg: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      Degree_Status: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      qb_flg: {
        type: Sequelize.STRING(15),
        allowNull: false,
        defaultValue: 'N'
      },
      ans_flg: {
        type: Sequelize.STRING(15),
        allowNull: false,
        defaultValue: 'N'
      },
      mismatch_flg: {
        type: Sequelize.STRING(15),
        allowNull: false,
        defaultValue: 'N'
      },
      Type_of_Exam: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      mismatch_remarks: {
        type: Sequelize.STRING(255),
        allowNull: false
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sub_master');
  }
};

