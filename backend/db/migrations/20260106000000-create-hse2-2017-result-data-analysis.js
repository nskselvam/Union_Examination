'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('HSE2_2017_RESULT_DATA_ANALYSIS', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      REVDT: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: null
      },
      REVNAME: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      DIST: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: null
      },
      DISTNAME: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      SCHL: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      SCH_NAME: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      PER_REGNO: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: null
      },
      NAME: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      SEX: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
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
    await queryInterface.dropTable('HSE2_2017_RESULT_DATA_ANALYSIS');
  }
};
