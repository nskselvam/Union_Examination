'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('valuation_payment_detail', {
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
      Chief_Descrption_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      Chief_Descrption: {
        type: Sequelize.STRING(25),
        allowNull: true
      },
      No_Daya_Max_Pap: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      Amount: {
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
    await queryInterface.dropTable('valuation_payment_detail');
  }
};
