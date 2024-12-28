'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('attendance', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4, // Automatically generates UUID
        allowNull: false,
      },
      student_id: {
        type: Sequelize.UUID, // Foreign key to Student table
        references: {
          model: 'student', // Table name of the Student model
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
      },
      status: {
        type: Sequelize.BOOLEAN, // Assuming status is 0/1 or an integer
        allowNull: false,
      },
      report_date: {
        type: Sequelize.DATEONLY, // Only stores the date
        allowNull: false,
      },
      user_class_teacher_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('attendance');
  },
};
