'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('datta_allowances', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      depcode: {
        type: Sequelize.STRING(5),
        allowNull: true
      },
      particulars: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      remuneration_data: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      incidental: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      accomodation_cost: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      billprovide: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      dearnessallowance: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      travelallowance: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      particulars_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      remuneration_name: {
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
    await queryInterface.dropTable('datta_allowances');
  }
};
