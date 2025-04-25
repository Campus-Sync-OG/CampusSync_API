// models/assignment.js
module.exports = function(sequelize, DataTypes) {
    return sequelize.define("teacher_subject", {
        emp_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      emp_name:{
        type:DataTypes.STRING,
        allowNull:false,
      },
      class_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      section: {
        type: DataTypes.STRING,
        allowNull: false
      },
      subjects: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },{
      sequelize,
      tableName: 'teacher_subject',
      timestamps: true,
  },
 );
};
  