const express = require('express');
const router = express.Router();
const db = require('../models/index');
const Op = db.Sequelize.Op

///usersにアクセスした際の処理
router.get('/',(req, res, next)=> {
  const nm = req.query.name;
  const ml = req.query.mail;
  db.User.findAll({
    where: {
      [Op.or]:[
        {name:{[Op.like]:'%'+nm+'%'}},
        {mail:{[Op.like]:'%'+ml+'%'}},
      ]
    }
  }).then(usrs => {
    var data = {
      title: 'Users/Index',
      content: usrs
    }
    res.render('users/index', data);
  });
});

module.exports = router;
