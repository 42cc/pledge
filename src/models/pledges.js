'use strict';
module.exports = (sequelize, DataTypes) => {
  var Pledges = sequelize.define('Pledges', {
    requester: DataTypes.STRING,
    performer: DataTypes.STRING,
    content: DataTypes.STRING,
    deadline: DataTypes.DATE,
    completed: DataTypes.BOOLEAN,
    expiredNotificationSent: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Pledges;
};