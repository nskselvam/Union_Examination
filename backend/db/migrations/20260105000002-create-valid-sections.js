'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('valid_sections', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sub_code: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      subcode_raw: {
        type: Sequelize.STRING(30),
        allowNull: true
      },
      qstn_num: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      max_mark: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      valid_qstn: {
        type: Sequelize.STRING(5),
        allowNull: true
      },
      section: {
        type: Sequelize.STRING(5),
        allowNull: true
      },
      sub_section: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      add_sub_section: {
        type: Sequelize.STRING(5),
        allowNull: true
      },
      created_on: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      updated_on: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      Eva_Mon_Year: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      BL_Point: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      CO_Point: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      PO_Point: {
        type: Sequelize.STRING(50),
        allowNull: true
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

    // Add indexes
    await queryInterface.addIndex('valid_sections', ['sub_code']);
    await queryInterface.addIndex('valid_sections', ['qstn_num']);
    await queryInterface.addIndex('valid_sections', ['section']);
    await queryInterface.addIndex('valid_sections', ['sub_section']);
    await queryInterface.addIndex('valid_sections', ['add_sub_section']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('valid_sections');
  }
};
