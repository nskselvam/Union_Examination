'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('valid_questions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      SUBCODE: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      SUBCODE_RAW: {
        type: Sequelize.STRING(30),
        allowNull: true,
        defaultValue: null
      },
      SECTION: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      FROM_QST: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      TO_QST: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      MARK_MAX: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      NOQST: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      SUB_SEC: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      Eva_Mon_Year: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      C_QST: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: null
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('valid_questions');
  }
};
