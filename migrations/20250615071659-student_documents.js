'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('student_documents', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      admission_no: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'student', // must match the actual student table name
          key: 'admission_no'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      class: {
        type: Sequelize.STRING,
        allowNull: false
      },
      section: {
        type: Sequelize.STRING,
        allowNull: false
      },
      certificate_status: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {
          caste_certificate: false,
          income_certificate: false,
          birth_certificate: false,
          transfer_certificate: false,
          aadhar_card: false
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('student_documents');
  }
};
