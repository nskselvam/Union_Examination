'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const user_role_masters = sequelize.define(
    "user_role_masters",
    {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    user_role_code: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true
    },
    user_role: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    freezeTableName: true,
    modelName: 'user_role_masters',
    timestamps: true
  });
  
  return user_role_masters;
};