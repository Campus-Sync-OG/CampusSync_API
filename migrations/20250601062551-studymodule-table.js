'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('studymodules', {
      id:
       { type: Sequelize.INTEGER,
         primaryKey: true,
          autoIncrement: true 
        },
      examName: 
      { type: Sequelize.STRING,
         allowNull: false 
        },
      subjectName:
       { type: Sequelize.STRING, 
        allowNull: false
       },
      topicName:
       { type: Sequelize.STRING, 
        allowNull: false
       },
      pdfUrl:
       { type: Sequelize.STRING,
         allowNull: false 
        },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('studymodules');
  },
};
