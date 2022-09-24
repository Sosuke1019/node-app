const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3'); // 追加
const { check, validationResult } = require('express-validator');

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
        title: 'Hello/Add',
        content: '新しいレコードを入力',
        form: {name:'', mail:'', age:0}
    }
    res.render('hello/add',data);
});

//フォーム送信されたときの処理
router.post('/add', [
    check('name','NAME は必ず入力して下さい。').notEmpty().escape(),
    check('mail','MAIL はメールアドレスを記入して下さい。').isEmail().escape(),
    check('age', 'AGE は0以上120以下で入力下さい。').custom(value => {
        return value >= 0 & value <= 120;
    })
], (req, res, next) => {
    //バリデーションのチェックを実行した結果をResultというオブジェクトとして返す
    const errors = validationResult(req);

    //ResultにErrorがあるかどうかを"isEmpty"メソッドでチェックする
    //isEmptyがfalseの場合(Errorが追加されている状態)のみエラーの処理を行っている
    if (!errors.isEmpty()) {
        var result = '<ul class="text-danger">';
        var result_arr = errors.array();
        for(var n in result_arr) {
            //msgはcheck関数の第二引数で指定したエラーメッセージが設定されているプロパティ
            //エラーメッセージをresultにまとめている
            result += '<li>' + result_arr[n].msg + '</li>'
        }
        result += '</ul>';
        var data = {
            title: 'Hello/Add',
            content: result,
            form: req.body
        }
        res.render('hello/add', data);
    } else {
        var nm = req.body.name;
        var ml = req.body.mail;
        var ag = req.body.age;
        db.serialize(() => {
            db.run('insert into mydata (name, mail, age) values (?, ?, ?)', nm, ml, ag);
        });
        res.redirect('/hello');
    }
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

router.get('/edit', (req, res, next) => {
    const id = req.query.id;
    db.serialize(() => {
        const q = "select * from mydata where id = ?";
        db.get(q, [id], (err, row) => {
            if (!err) {
                var data = {
                title: 'hello/edit',
                content: 'id = ' + id + ' のレコードを編集：',
                mydata: row
            }
            res.render('hello/edit', data);
            }   
        }); 
    }); 
});

router.post('/edit', (req, res, next) => {
    const id = req.body.id;
    const nm = req.body.name;
    const ml = req.body.mail;
    const ag = req.body.age;
    const q = "update mydata set name = ?, mail = ?, age = ? where id = ?";
    db.serialize(() => {
        db.run(q, nm, ml, ag, id);
    });
    res.redirect('/hello');
});

router.get('/delete', (req, res, next) => {
    //diを指定
    const id = req.query.id;
    db.serialize(() => {
        const q = "select * from mydata where id = ?";
        //select文を実行
        db.get(q, [id], (err, row) => {
            if (!err) {
                var data = {
                title: 'Hello/Delete',
                content: 'id = ' + id + ' のレコードを削除：',
                //結果をmydataに設定
                mydata: row
            }
            res.render('hello/delete', data);
            }   
        }); 
    }); 
});

router.post('/delete', (req, res, next) => {
    const id = req.body.id;
    db.serialize(() => {
        const q = "delete from mydata where id = ?";
        db.run(q, id);
    });
    res.redirect('/hello');
});

//node.js側で/hello/findにアクセスした際の処理
//フォームの値を使って検索した結果をmydataとして渡す
router.get('/find',(req, res, next) => {
    db.serialize(() => {
      db.all("select * from mydata",(err, rows) => {
        if (!err) {
            var data = {
                title: 'Hello/find',
                find:'',
                content:'検索条件を入力して下さい。',
                mydata: rows
            };
            res.render('hello/find', data);
            }   
        }); 
    }); 
});

router.post('/find', (req, res, next) => {
    var find = req.body.find;
    db.serialize(() => {
        var q = "select * from mydata where ";
        db.all(q + find, [], (err, rows) => {
            if (!err) {
                var data = {
                    title: 'Hello/find',
                    find:find,
                    content: '検索条件 ' + find,
                    mydata: rows
                }
            res.render('hello/find', data);
            } 
        }); 
    }); 
});


module.exports = router;
