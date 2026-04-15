'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('month_year_masters', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Eva_Month: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      Eva_Year: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      Eva_Month_Des: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      Eva_Year_Desc: {
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
    await queryInterface.dropTable('month_year_masters');
  }
};
