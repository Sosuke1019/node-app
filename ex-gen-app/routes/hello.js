const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3'); // 追加

// データベースオブジェクトの取得
const db = new sqlite3.Database('mydb.sqlite3');

// GETアクセスの処理
router.get('/',(req, res, next) => {
    // データベースのシリアライズ
    db.serialize(() => {
        var rows = "";
      //レコードをすべて取り出す
      db.each("select * from mydata",(err, row) => {
        // データベースアクセス完了時の処理
        if (!err) {
            rows += "<tr><th>" + row.id + "</th><td>"+ row.name + "</td><td></tr>";
        }
    }, (err, count) => {
        if (!err) {
            var data = {
                title: 'Hello!',
                content: rows // 取得したレコードデータ
            };
            //hello.ejsファイルを指す
            res.render('hello/index', data);
            }
        }); 
    }); 
});

router.get('/add', (req,res,next) => {
    var data = {
        title: 'Hello/add',
        content: '新しいレコードを入力'
    }
    res.render('hello/add',data)
});

//フォーム送信されたときの処理
router.post('/add', (req,res,next) => {
    const nm = req.body.name;
    const ml = req.body.mail;
    const ag = req.body.age;
    db.serialize (() => {
        db.run('insert into mydata (name, mail, age) values(?, ?, ?)', nm, ml, ag);
    });
    res.redirect('/hello');
});

router.get('/show', (req, res, next) => {
    const id = req.query.id;
    db.serialize(() => {
        const q = "select * from mydata where id = ?";
        //第2引数には?に渡す値を配列にまとめたもの
        db.get(q, [id], (err, row) => {
            if (!err) {
                var data = {
                title: 'Hello/show',
                content: 'id = ' + id + ' のレコード：',
                mydata: row
            }
            res.render('hello/show', data);
            }   
        }); 
    }); 
});

module.exports = router;
