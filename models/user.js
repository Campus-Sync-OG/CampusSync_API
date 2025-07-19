const { Sequelize, DataTypes } = require("sequelize");

module.exports = function (sequelize) {
  return sequelize.define(
    "user",
    {
      unique_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      role: {
        type: DataTypes.ENUM("admin", "operator", "student", "teacher", "principal"),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone_number: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
      },
      base_salary: {
        type: DataTypes.FLOAT,
        allowNull: true, // or false if mandatory for teachers/principals
      },

      first_time_login: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, // Indicates whether the user has logged in for the first time
      },
      last_password_reset: {
        type: DataTypes.DATE,
        allowNull: true,
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
      tableName: "user",
      timestamps: false,
      hooks: {
        beforeValidate: async (user, options) => {
          if (!user.unique_id) {
            let prefix;
      
            switch (user.role) {
              case "student":
                prefix = "S";
                break;
              case "teacher":
                prefix = "T";
                break;
              case "principal":
                prefix = "P";
                break;
              case "admin":
                prefix = "A"; // Use 'A' for Admin
                break;
              case "operator":
                prefix = "O"; // Use 'O' for Operator
                break;
              default:
                throw new Error("Invalid role");
            }
      
            const year = new Date().getFullYear();
      
            // Start a transaction (if not already started)
            const transaction = options.transaction || (await sequelize.transaction());
      
            try {
              // Query to get the max serial number for the given role and year
              const result = await sequelize.query(
                `SELECT MAX(CAST(SUBSTRING(unique_id FROM '\\d{4}$') AS INTEGER)) AS max_serial
                 FROM "user"
                 WHERE unique_id LIKE :prefixPattern`,
                {
                  replacements: { prefixPattern: `${prefix}-${year}-%` }, // Use correct replacement key
                  type: Sequelize.QueryTypes.SELECT,
                  transaction,
                }
              );
      
              const maxSerial = result[0]?.max_serial || 0;
              const newSerialNumber = maxSerial + 1;
      
              // Set the new unique_id
              user.unique_id = `${prefix}-${year}-${String(newSerialNumber).padStart(4, "0")}`;
      
              // Commit the transaction if it was started within this hook
              if (!options.transaction) {
                await transaction.commit();
              }
            } catch (error) {
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
