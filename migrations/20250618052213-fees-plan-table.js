'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('fee_plan', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      class_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      section_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      admission_no: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'student',  // Make sure table name is correct
          key: 'admission_no'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      feestype: {
        type: Sequelize.ENUM('Tuition', 'Books', 'Transport', 'Uniform', 'All','Hostel'),
        allowNull: false
      },
      total_fee: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      item_details: {
        type: Sequelize.JSON, // ✅ Use JSON data type
        allowNull: true, // Not required for all fee types
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('fee_plan');
    // Clean up ENUM type if needed (Postgres only, for MySQL no need)
    // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_fee_plan_feestype";');
  }
};
