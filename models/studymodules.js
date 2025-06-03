module.exports = (sequelize, DataTypes) => {
  const StudyModule = sequelize.define('studymodules', {
    examName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subjectName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    topicName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pdfUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });

  return StudyModule;
};
