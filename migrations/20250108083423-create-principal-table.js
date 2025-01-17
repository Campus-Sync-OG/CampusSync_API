'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Create the "principal" table
      await queryInterface.createTable('principal', {
        unique_id: {
          type: Sequelize.STRING(50),
          allowNull: false,
          primaryKey: true, 
          autoIncrement: true,// Unique identifier for the principal
        },
        p_id: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true, // Ensure each p_id is unique
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false, // Principal's name must be provided
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false, // Password is mandatory
        },
        phone_no: {
          type: Sequelize.STRING(15),
          allowNull: true, // Optional field
          validate: {
            is: /^\+?[1-9]\d{1,14}$/, // Regex to validate phone number format (e.g., international format)
          },
        },
        email: {
          type: Sequelize.STRING(100),
          allowNull: true, // Optional field
          validate: {
            isEmail: true, // Ensure valid email format
          },
        },
        school_name: {
          type: Sequelize.STRING(100),
          allowNull: false, // A principal must be associated with a school
        },
        add_teacher: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false, // By default, principals cannot add teachers
        },
        joining_date: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.NOW, // Defaults to current date if not provided
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW, // Automatically handled by Sequelize
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW, // Automatically handled by Sequelize
        },
      });

      console.log('principal table created successfully.');
    } catch (error) {
      console.error('Error creating principal table:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Drop the "principal" table
      await queryInterface.dropTable('principal');
      console.log('principal table dropped successfully.');
    } catch (error) {
      console.error('Error dropping principal table:', error);
      throw error;
    }
  },
};
