'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hostel_rooms', {
      room_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },

      block_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'hostel_blocks',
          key: 'id',
        },
      },

      room_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      sharing_type: {
        type: Sequelize.ENUM('Single', '2 Sharing', '3 Sharing', '4 Sharing'),
        allowNull: false,
      },

      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('hostel_rooms');
  },
};
