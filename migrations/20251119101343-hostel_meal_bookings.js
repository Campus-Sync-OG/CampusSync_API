'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hostel_meal_bookings', {
      booking_id: {
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

      menu_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'hostel_meal_menu',
          key: 'menu_id',
        },
      },

      status: {
        type: Sequelize.ENUM('Booked', 'Availed', 'Missed'),
        allowNull: false,
        defaultValue: 'Booked',
      },

      qr_code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('hostel_meal_bookings');
  },
};
