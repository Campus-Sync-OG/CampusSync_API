'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hostel_allotments', {
      allotment_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },

      admission_no: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'student',
          key: 'admission_no',
        },
      },

      room_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'hostel_rooms',
          key: 'room_id',
        },
      },

      request_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM('Requested', 'Room Allotted', 'Rejected'),
        allowNull: false,
        defaultValue: 'Requested',
      },

      start_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('hostel_allotments');
  },
};
