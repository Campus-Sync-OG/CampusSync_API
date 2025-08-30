'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('principal', {
      p_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        references: {
          model: 'user',
          key: 'unique_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phone_no: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      school_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      images: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      designation: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      gender: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      joining_date: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('principal');
  }
};
