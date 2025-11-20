'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('certificates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      admission_no: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'student', // Make sure this matches your actual student table name
          key: 'admission_no',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      certificate_type: {
        type: Sequelize.ENUM(
           'Transfer Certificate',
        'Character Certificate',
        'Bonafide Certificate',
        'Study Certificate',
        'Migration Certificate',
        'Scholarship Certificate'
        ),
        allowNull: false,
      },
      reason: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('certificates');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_certificates_certificate_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_certificates_status";');
  },
};
