'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chief_remarks', {
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
      feedback: {
        type: Sequelize.STRING(250),
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
      RemarksSubject: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      Insert_Date: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      Barcode: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      view_status: {
        type: Sequelize.STRING(5),
        allowNull: false,
        defaultValue: 'N'
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('chief_remarks');
  }
};
