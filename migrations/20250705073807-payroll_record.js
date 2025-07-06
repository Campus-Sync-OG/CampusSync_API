'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payroll_record', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      employee_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'teacher',
          key: 'emp_id',
        },
        onDelete: 'CASCADE',
      },
      month: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      earnings: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      deductions: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      net_pay: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      earnings_breakdown: {
        type: Sequelize.JSONB, // use Sequelize.JSON if not on PostgreSQL
        allowNull: true,
      },
      deductions_breakdown: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'processed',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('payroll_record');
  }
};
