module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('academics', {
      admission_no: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: {
          model: 'student', // Table name
          key: 'admission_no',
        },
        onDelete: 'CASCADE',
      },
      teacher_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      class_grade: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      term_semester: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      academic_year: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      marks_obtained: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      total_marks: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      exam_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('academics');
  },
};
