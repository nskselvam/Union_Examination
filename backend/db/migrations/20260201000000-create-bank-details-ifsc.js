'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bank_details_ifsc', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      BANK: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      IFSC: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      BRANCH: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      ADDRESS: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      CITY1: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      CITY2: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      STATE: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      STD_CODE: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      PHONE: {
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
    await queryInterface.dropTable('bank_details_ifsc');
  }
};
