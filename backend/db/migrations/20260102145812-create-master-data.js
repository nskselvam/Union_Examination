'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('master_data', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      D_Code: {
        type: Sequelize.STRING
      },
      Degree_Name: {
        type: Sequelize.STRING
      },
      Flg: {
        type: Sequelize.STRING
      },
      Time_Flg: {
        type: Sequelize.STRING
      },
      Paper_Time: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('master_data');
  }
};