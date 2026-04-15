'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('staff_master', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Eva_Id: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      FACULTY_NAME: {
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
      Mobile_Number: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      Email_Id: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      EMPLOYEE_CATEGORY: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      SUPERVISOR_OFFICENAME: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      Faculty: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      campus_details: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      flg: {
        type: Sequelize.STRING(1),
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('staff_master');
  }
};
