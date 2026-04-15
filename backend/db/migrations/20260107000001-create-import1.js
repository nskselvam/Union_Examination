'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('import1', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      batchname: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      subcode: {
        type: Sequelize.STRING(15),
        allowNull: true,
        defaultValue: null
      },
      Dep_Name: {
        type: Sequelize.STRING(5),
        allowNull: true,
        defaultValue: null
      },
      barcode: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      Evaluator_Id: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: null
      },
      Chef_exam_chk: {
        type: Sequelize.STRING(250),
        allowNull: true,
        defaultValue: null
      },
      re_chk_ce: {
        type: Sequelize.STRING(15),
        allowNull: true,
        defaultValue: null
      },
      reject_flg: {
        type: Sequelize.STRING(5),
        allowNull: true,
        defaultValue: null
      },
      Modify_flg: {
        type: Sequelize.STRING(5),
        allowNull: true,
        defaultValue: null
      },
      R_No: {
        type: Sequelize.BIGINT,
        allowNull: true,
        defaultValue: null
      },
      R_No1: {
        type: Sequelize.BIGINT,
        allowNull: true,
        defaultValue: null
      },
      R_No_Date: {
        type: Sequelize.STRING(30),
        allowNull: true,
        defaultValue: null
      },
      FLG: {
        type: Sequelize.STRING(3),
        allowNull: true,
        defaultValue: null
      },
      Checked: {
        type: Sequelize.STRING(5),
        allowNull: true,
        defaultValue: null
      },
      E_flg: {
        type: Sequelize.STRING(5),
        allowNull: true,
        defaultValue: null
      },
      A_date: {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: null
      },
      A_time: {
        type: Sequelize.STRING(25),
        allowNull: true,
        defaultValue: null
      },
      ip: {
        type: Sequelize.STRING(15),
        allowNull: true,
        defaultValue: null
      },
      total: {
        type: Sequelize.STRING(11),
        allowNull: true,
        defaultValue: null
      },
      tot_round: {
        type: Sequelize.STRING(5),
        allowNull: true,
        defaultValue: null
      },
      tot_ce: {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: null
      },
      tot_round_ce: {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: null
      },
      total2: {
        type: Sequelize.STRING(5),
        allowNull: true,
        defaultValue: null
      },
      PFLG: {
        type: Sequelize.STRING(5),
        allowNull: true,
        defaultValue: null
      },
      tflg: {
        type: Sequelize.STRING(4),
        allowNull: true,
        defaultValue: null
      },
      checkdate: {
        type: Sequelize.STRING(25),
        allowNull: true,
        defaultValue: null
      },
      checkdate_ce: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: null
      },
      ImgCnt: {
        type: Sequelize.STRING(5),
        allowNull: true,
        defaultValue: null
      },
      ImpDate: {
        type: Sequelize.STRING(25),
        allowNull: true,
        defaultValue: null
      },
      Implot: {
        type: Sequelize.STRING(5),
        allowNull: false
      },
      Eva_Mon_Year: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      Flname: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      Remarks: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      Chief_Flg: {
        type: Sequelize.STRING(1),
        allowNull: false,
        defaultValue: 'N'
      },
      Chief_checkdate: {
        type: Sequelize.STRING(25),
        allowNull: true,
        defaultValue: null
      },
      Chief_Evaluator_Id: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: null
      },
      Chief_Checked: {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: null
      },
      Chief_E_flg: {
        type: Sequelize.STRING(5),
        allowNull: true,
        defaultValue: null
      },
      Chief_A_date: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: null
      },
      Chief_A_time: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null
      },
      Chief_ip: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: null
      },
      Chief_total: {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: null
      },
      Chief_tot_round: {
        type: Sequelize.STRING(15),
        allowNull: true,
        defaultValue: null
      },
      Chief_Valuation_Evaluator_Id: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: null
      },
      Chief_tflg: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: null
      },
      Chief_checkdate_Valuation: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: null
      },
      camp_offcer_id_examiner: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: null
      },
      Camp_id: {
        type: Sequelize.STRING(25),
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

    // Add indexes
    await queryInterface.addIndex('import1', ['subcode'], {
      name: 'subcode'
    });
    await queryInterface.addIndex('import1', ['R_No'], {
      name: 'R_No'
    });
    await queryInterface.addIndex('import1', ['barcode'], {
      name: 'barcode'
    });
    await queryInterface.addIndex('import1', ['Evaluator_Id'], {
      name: 'Evaluator_Id'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('import1');
  }
};
