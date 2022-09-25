const { query } = require('express');
const express = require('express');
const router = express.Router();
const db = require('../models/index');
const Op = db.Sequelize.Op

///usersにアクセスした際の処理
router.get('/',(req, res, next)=> {
  const nm = req.query.name;
  const ml = req.query.mail;
  db.User.findAll().then(usrs => {
    var data = {
      title: 'Users/Index',
      content: usrs
    }
    res.render('users/index', data);
  });
});


router.get('/add',(req, res, next)=> {
  var data = {
    title: 'Users/Add'
  }
  res.render('users/add', data);
});

router.post('/add',(req, res, next)=> {
  db.sequelize.sync()
  //{}に保存するレコードの情報が用意される
    .then(() => db.User.create({
      name: req.body.name,
      pass: req.body.pass,
      mail: req.body.mail,
      age: req.body.age
    }))
    //create実行後の処理
    .then(usr => {
      res.redirect('/users');
    });
});

router.get('/edit',(req,res,next) => {
  //"findByPk"は引数に指定したIDのモデルを取得するメソッド
  db.User.findByPk(req.query.id)
  .then(usr => {
    var data = {
      title: 'Users/Edit',
      form: usr
    }
    res.render('users/edit', data)
  });
});

router.post('/edit',(req, res, next)=> {
  db.User.findByPk(req.body.id)
  .then(usr => {
    usr.name = req.body.name;
    usr.pass = req.body.pass;
    usr.mail = req.body.mail;
    usr.age = req.body.age;
    usr.save().then(()=>res.redirect('/users'));
  });
});

router.get('/delete',(req,res,next) =>{
  //クエリーパラメータのidを使ってUserモデルを取得し、テンプレート側に渡して表示している
  db.User.findByPk(req.query.id)
  .then(usr => {
    var data = {
      title: 'Users/Delete',
      form: usr
    }
    res.render('users/delete', data);
  });
});

router.post('/delete',(req,res,next) =>{
  db.User.findByPk(req.body.id)
  .then(usr => {
    usr.destroy().then(()=>res.redirect('/users'));
  });
});

module.exports = router;