const { on } = require("pdfkit");

module.exports = (sequelize, DataTypes) => {
    const Timetable = sequelize.define('timetable', {
      classSectionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'class_section',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      day: {
        type: DataTypes.STRING,
        allowNull: false
      },
      time: {
        type: DataTypes.STRING,
        allowNull: false
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      tableName: 'timetable'
    });
  
    Timetable.associate = (models) => {
      Timetable.belongsTo(models.ClassSection, { foreignKey: 'classSectionId' });
    };
  
    return Timetable;
  };
  