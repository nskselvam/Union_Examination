'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('staff_bank_master', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Slno: {
        type: Sequelize.DOUBLE,
        allowNull: true
      },
      EMPLOYEE_ID: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      EMPLOYEE_CODE: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      EMPLOYEE_NAME: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      DIVISION: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      DESIGNATION: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      GENDER: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      CONTACT_NUMBER: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      EMAIL: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      BANK_ACCOUNT_NUMBER: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      OFFICE_NAME: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      PAYROLL_PROCESSED_MONTH: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      IFSC: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      BANK_NAME: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      BRANCH: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      NATUREOFBANK: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      BANK_ADDRESS: {
        type: Sequelize.STRING(255),
        allowNull: true
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
    await queryInterface.dropTable('staff_bank_master');
  }
};
