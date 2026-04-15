'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('valid_ips', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Ip_Address: {
        type: Sequelize.STRING
      },
      block_name: {
        type: Sequelize.STRING
      },
      vflg: {
        type: Sequelize.STRING
      },
      campus: {
        type: Sequelize.STRING
      },
      floor: {
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
    await queryInterface.dropTable('valid_ips');
  }
};