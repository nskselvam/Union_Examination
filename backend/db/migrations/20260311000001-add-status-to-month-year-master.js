'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('month_year_masters', 'Month_Year_Status', {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: 'Y'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('month_year_masters', 'Month_Year_Status');
  }
};
