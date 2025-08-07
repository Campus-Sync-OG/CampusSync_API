module.exports = (sequelize, DataTypes) => {
    const Parent= sequelize.define(
      "parent",
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        admission_no: {
          type: DataTypes.STRING,
          allowNull: false,
          references: {
            model: "student", // Reference to the Student model
            key: "admission_no",
          },
        },
        father_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        father_contact: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        father_email: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        mother_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        mother_contact: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        mother_email: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        address: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        religion: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        father_image: {
          type: DataTypes.STRING,
          allowNull: true,
        },  
        mother_image: {
          type: DataTypes.STRING,
          allowNull: true,
        },  
        
        
      },
      {
        tableName: "parent",
        timestamps: true, // Adds createdAt and updatedAt fields
      }
    );
  
    return Parent;
  };
  