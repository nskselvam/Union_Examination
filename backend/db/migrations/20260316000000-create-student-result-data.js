'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('student_result_data', {
      sno: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      StudentID: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: null
      },
      Studentsemester: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      SubjectID: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      Subjectsemester: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      Dummy_NO: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      RegisterNo: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      BundleNO: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      Score: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      SubjectCode: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      Grade: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      CourseID: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      Exammonth: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      ExamYear: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      SubjectDescription: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      Courseshortname: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      Branch: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      EmployeeID: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      rscore: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      StudentMobileno: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      StudentOfficalEmailID: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      StudentContactNo: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      StudentPersonalEmailID: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      Evaluator_Id: {
        type: Sequelize.STRING(25),
        allowNull: true,
        defaultValue: null
      },
      FACULTY_NAME: {
        type: Sequelize.STRING(150),
        allowNull: true,
        defaultValue: null
      },
      Mobile_Number: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      Email_Id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      Eva_Mon_Year: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    // Add indexes for frequently queried columns
    await queryInterface.addIndex('student_result_data', ['RegisterNo'],  { name: 'idx_student_result_RegisterNo'  });
    await queryInterface.addIndex('student_result_data', ['SubjectCode'], { name: 'idx_student_result_SubjectCode' });
    await queryInterface.addIndex('student_result_data', ['Dummy_NO'],    { name: 'idx_student_result_Dummy_NO'    });
    await queryInterface.addIndex('student_result_data', ['Evaluator_Id'],{ name: 'idx_student_result_Evaluator_Id'});
    await queryInterface.addIndex('student_result_data', ['Eva_Mon_Year'],{ name: 'idx_student_result_Eva_Mon_Year'});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('student_result_data');
  }
};
