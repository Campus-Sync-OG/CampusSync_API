// migrations/20251119XXXXXX-create-hostel-registration.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // create table
    await queryInterface.createTable('hostel_registration', {
      registration_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()') // Postgres extension; change if needed
      },

      admission_no: {
        type: Sequelize.STRING,
        allowNull: false,
        references: { model: 'student', key: 'admission_no' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      hostel_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'hostel', key: 'hostel_id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      premium_room: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },

      preferred_sharing: {
        type: Sequelize.ENUM('Single', 'Double', 'Triple', '3 Sharing', '4 Sharing'),
        allowNull: true
      },

      payment_type: {
        type: Sequelize.ENUM('Online', 'Offline', 'Cash', 'UPI', 'Netbanking'),
        allowNull: true
      },

      total_fee: {
        type: Sequelize.DECIMAL(12,2),
        allowNull: false,
        defaultValue: 0.00
      },

      caution_fee: {
        type: Sequelize.DECIMAL(12,2),
        allowNull: false,
        defaultValue: 0.00
      },

      is_rejoiner: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },

      status: {
        type: Sequelize.ENUM('Pending','Registered','Rejected','Cancelled'),
        allowNull: false,
        defaultValue: 'Pending'
      },

      remarks: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      registered_on: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // indexes for quick lookup
    await queryInterface.addIndex('hostel_registration', ['admission_no']);
    await queryInterface.addIndex('hostel_registration', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('hostel_registration');

    // drop ENUM types in Postgres (clean up)
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_hostel_registration_preferred_sharing\";");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_hostel_registration_payment_type\";");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_hostel_registration_status\";");
  }
};
