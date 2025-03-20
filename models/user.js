const { Sequelize } = require('sequelize');
const sequelize = require('../config/sequelize');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('user', {
      unique_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      role: {
        type: DataTypes.ENUM('admin','operator'),
        allowNull: false,
      },
      phone_number: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      status :{
        type: DataTypes.ENUM('active', 'inactive'), 
        allowNull: false,
        defaultValue: 'active',
      },
      password:{
        type: DataTypes.STRING,
        allowNull: false,

      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
      },
    }, 
    {
      tableName: 'user',
      timestamps: false,
      hooks: {
        beforeValidate: async (user, options) => {
          if (!user.unique_id) {
            let prefix;
      
            switch (user.role) {
              case 'student':
                prefix = 'S';
                break;
              case 'teacher':
                prefix = 'T';
                break;
              case 'principal':
                prefix = 'P';
                break;
              case 'admin':
                prefix = 'U'; // Use 'A' for Administrator
                break;
              case 'operator':
                prefix = 'U'; // Use 'O' for Operator
                break;
              default:
                throw new Error('Invalid role');
            }
      
            const year = new Date().getFullYear();
      
            // Start a transaction (if not already started)
            const transaction = options.transaction || await sequelize.transaction();
      
            try {
              // Query to get the max serial number for the given role and year
              const result = await sequelize.query(
                `SELECT MAX(CAST(SUBSTRING(unique_id FROM '\\d{4}$') AS INTEGER)) AS max_serial
                 FROM "user"
                 WHERE unique_id LIKE :pattern`,
                {
                  type: sequelize.QueryTypes.SELECT,
                  replacements: { pattern: `${prefix}-${year}-%` },
                  transaction,
                }
              );
      
              const maxSerial = result[0].max_serial || 0;
              const newSerialNumber = maxSerial + 1;
      
              // Set the new unique_id
              user.unique_id = `${prefix}-${year}-${String(newSerialNumber).padStart(4, '0')}`;
      
              // Commit the transaction if it was started within this hook
              if (!options.transaction) {
                await transaction.commit();
              }
            } catch (error) {
              // Rollback the transaction if it was started within this hook
              if (!options.transaction) {
                await transaction.rollback();
              }
              throw error;
            }
          }
        },
      },
      
    }
  );
};
