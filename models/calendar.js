module.exports = (sequelize, DataTypes) => {
  return sequelize.define("calendar", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tag: {
      type: DataTypes.STRING, 
      allowNull: false, // Example: "Holiday", "Exam", "Meeting"
    },
    visibleTo: {
      type: DataTypes.JSON, 
      allowNull: true, 
      // Example: ["Teacher", "Student", "Parent"]
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  });
};
