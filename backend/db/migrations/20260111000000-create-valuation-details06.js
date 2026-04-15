'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('val_data_06', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Dep_Name: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      sec_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      barcode: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      qbno: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      page_no: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      subcode: {
        type: Sequelize.STRING(25),
        allowNull: false
      },
      section: {
        type: Sequelize.STRING(5),
        allowNull: false
      },
      sub_section: {
        type: Sequelize.STRING(5),
        allowNull: true
      },
      add_sub_section: {
        type: Sequelize.STRING(5),
        allowNull: true
      },
      max_marks: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      Qbs_Page_No: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      eva_id: {
        type: Sequelize.STRING(25),
        allowNull: true
      },
      evid_ce: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      checkdate: {
        type: Sequelize.STRING(25),
        allowNull: false
      },
      img_mark1: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      cmt: {
        type: Sequelize.STRING(5),
        allowNull: true
      },
      Comment: {
        type: Sequelize.STRING(250),
        allowNull: true
      },
      Marks_Get: {
        type: Sequelize.STRING(25),
        allowNull: false
      },
      tick: {
        type: Sequelize.STRING(5),
        allowNull: true
      },
      img_mark: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      Blank: {
        type: Sequelize.STRING(2),
        allowNull: true
      },
      RI: {
        type: Sequelize.STRING(2),
        allowNull: true
      },
      RI_cmt: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      Irrelevant: {
        type: Sequelize.STRING(2),
        allowNull: true
      },
      IR_cmt: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      NotAnswered: {
        type: Sequelize.STRING(25),
        allowNull: true
      },
      vflg: {
        type: Sequelize.STRING(4),
        allowNull: true
      },
      updated_on: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      valid_qbs: {
        type: Sequelize.STRING(5),
        allowNull: false,
        defaultValue: 'N'
      },
      FLG: {
        type: Sequelize.STRING(5),
        allowNull: false,
        defaultValue: 'N'
      },
      Eva_Mon_Year: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      Chief_Flg: {
        type: Sequelize.STRING(5),
        allowNull: false,
        defaultValue: 'N'
      },
      Chief_checkdate: {
        type: Sequelize.STRING(25),
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
      valuation_type: {
        type: Sequelize.STRING(1),
        allowNull: false
      },
      Examiner_type: {
        type: Sequelize.STRING(1),
        allowNull: false
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
    await queryInterface.dropTable('val_data_06');
  }
};
