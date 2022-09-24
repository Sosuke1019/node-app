'use strict';
module.exports = (sequelize, DataTypes) => {
  //sequelize.define(モデル名,モデルの属性,オプション);
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    pass: DataTypes.STRING,
    mail: DataTypes.STRING,
    age: DataTypes.INTEGER
  }, {});
  //associateとは他のモデルとの関連に関するもの
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};