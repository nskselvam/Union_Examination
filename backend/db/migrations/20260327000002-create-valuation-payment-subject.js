'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('valuation_payment_subject', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Valuation_Payment_Master_Id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      Subcode: {
        type: Sequelize.STRING(25),
        allowNull: true
      },
      Subname: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      No_Paper: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      Paper_Amount: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      Total: {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('valuation_payment_subject');
  }
};
