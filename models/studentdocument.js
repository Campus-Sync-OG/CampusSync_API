module.exports = function (sequelize, DataTypes) {
  const StudentDocuments = sequelize.define('student_documents', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    admission_no: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'student', // name of the table, not the model file
        key: 'admission_no'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    class: {
      type: DataTypes.STRING,
      allowNull: false
    },
    section: {
      type: DataTypes.STRING,
      allowNull: false
    },
    certificate_status: {
      type: DataTypes.JSONB,
      defaultValue: {
        caste_certificate: false,
        income_certificate: false,
        birth_certificate: false,
        transfer_certificate: false,
        aadhar_card: false
      }
    }
  }, {
    tableName: 'student_documents',
    timestamps: true
  });

 

  return StudentDocuments;
};
