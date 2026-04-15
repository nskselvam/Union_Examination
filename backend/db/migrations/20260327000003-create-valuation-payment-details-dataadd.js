'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Valuation_Payment_Details_DataAdd', {
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
      Allowance_Desc: {
        type: Sequelize.STRING(25),
        allowNull: true
      },
      Add_Amt: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      Da_Amt: {
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
    await queryInterface.dropTable('Valuation_Payment_Details_DataAdd');
  }
};
