'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('teacher', {
      emp_id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'user',
          key: 'unique_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      emp_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      blood_gp: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      religion: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone_no: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      joining_date: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
      },
      role: {
        type: Sequelize.ENUM('classTeacher', 'subjectTeacher'),
        allowNull: false,
        defaultValue: 'subjectTeacher',
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      gender: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      dob: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      images: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      salary_structure_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'salary_structure',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Only drop the table, no enum cleanup
    await queryInterface.dropTable('teacher');
    
  }
};
