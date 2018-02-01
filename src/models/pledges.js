'use strict';
module.exports = (sequelize, DataTypes) => {
  var Pledges = sequelize.define('Pledges', {
    requester: {
      type: DataTypes.STRING,
      allowNull: false
    },
    performer: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: DataTypes.STRING,
    deadline: DataTypes.DATE,
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    expiredNotificationSent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Pledges;
};