'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Pledges', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
      },
      requester: {
        type: Sequelize.STRING
      },
      performer: {
        type: Sequelize.STRING
      },
      content: {
        type: Sequelize.STRING
      },
      deadline: {
        type: Sequelize.DATE
      },
      completed: {
        type: Sequelize.BOOLEAN
      },
      expiredNotificationSent: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Pledges');
  }
};