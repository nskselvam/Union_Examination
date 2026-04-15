'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('valuation_remarks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      evaluator_id: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      evaluator_name: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      Remarks_Type: {
        type: Sequelize.STRING(5),
        allowNull: true
      },
      Remarks_value: {
        type: Sequelize.STRING(5),
        allowNull: true
      },
      msg: {
        type: Sequelize.STRING(250),
        allowNull: true
      },
      evaluator_subject: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      Dummy_Number: {
        type: Sequelize.STRING(25),
        allowNull: true
      },
      RemarksSubject: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      Campofficerid: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      Campid: {
        type: Sequelize.STRING(25),
        allowNull: false
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
    await queryInterface.dropTable('valuation_remarks');
  }
};
