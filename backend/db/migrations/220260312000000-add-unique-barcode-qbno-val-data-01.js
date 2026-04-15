'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Drop old barcode+qbno unique constraint if it exists
    try {
      await queryInterface.removeConstraint('val_data_02', 'barcode_qbno_unique');
    } catch (e) {
      // constraint didn't exist, ignore
    }

    // Step 2: Remove duplicate rows — keep the one with the lowest id
    // for the new 8-field composite key
    await queryInterface.sequelize.query(`
      DELETE FROM val_data_02
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM val_data_02
        GROUP BY sec_id, barcode, qbno, subcode, section, eva_id, valuation_type, "Examiner_type"
      )
    `);

    // Step 3: Add new 8-field composite unique constraint
    await queryInterface.addConstraint('val_data_02', {
      fields: ['sec_id', 'barcode', 'qbno', 'subcode', 'section', 'eva_id', 'valuation_type', 'Examiner_type'],
      type: 'unique',
      name: 'unique_val_data_02_combined'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('val_data_02', 'unique_val_data_02_combined');
  }
};
