'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('teacher', {
      emp_id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'user', // Assumes 'user' table already exists
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
<<<<<<<< HEAD:migrations/20250715103520-teacher-table.js
        type: Sequelize.ENUM('Male', 'Female'),
========
        type: Sequelize.STRING,
>>>>>>>> main:migrations/20250716052232-teacher-table.js
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
<<<<<<<< HEAD:migrations/20250715103520-teacher-table.js
========
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
>>>>>>>> main:migrations/20250716052232-teacher-table.js
    });
  },

  down: async (queryInterface, Sequelize) => {
<<<<<<<< HEAD:migrations/20250715103520-teacher-table.js
    // Drop ENUMs explicitly before dropping the table (important for Postgres)
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_teacher_role";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_teacher_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_teacher_gender";');

    await queryInterface.dropTable('teacher');
  },
========
    // Only drop the table, no enum cleanup
    await queryInterface.dropTable('teacher');
    
  }
>>>>>>>> main:migrations/20250716052232-teacher-table.js
};
