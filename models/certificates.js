module.exports = function (sequelize, DataTypes) {
  return sequelize.define('certificates', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    admission_no: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'student',
        key: 'admission_no',
      },
    },
    certificate_type: {
      type: DataTypes.ENUM(
        'Transfer Certificate',
        'Character Certificate',
        'Bonafide Certificate',
        'Study Certificate',
        'Migration Certificate',
        'Scholarship Certificate'
      ),
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
  }, {
    tableName: 'certificates',
    timestamps: true,
  });
};
