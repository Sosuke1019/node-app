'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type:DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "名前はか必ず入力してください。"
        }
      }
    },
    pass: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "パスワード必ず入力してください。"
        }
      }
    },
    mail: {
      type: DataTypes.STRING,
      validate: {
        isEmail: {
          msg: "メールアドレスを入力下さい。"
        }
      }
    },
    age: {
      type: DataTypes.INTEGER,
      validate: {
        isInt: {msg: "整数を入力下さい。"},
        min: {args: [0],
        msg: "ゼロ以上の値が必要です。"
        }
      }
    }
  }, {});
  //associateとは他のモデルとの関連に関するもの
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};