const express = require('express');
const router = express.Router();
const db = require('../models/index');
const { Op } = require("sequelize");

const pnum = 10;

/*sessionとは? -> クライアントごとに値を保管する仕組み
IDでクライアントを特定し、クライアントごとに値をサーバー側で保管している*/

//ログインのチェック
function check(req,res) {
    //セッションからloginという値がnullかどうかを調べる
    if (req.session.login == null) {
        //'boards'はログイン後に戻るページのアドレス
        req.session.back = '/boards';
        res.redirect('/users/login');
        //checkを呼び出した結果がtureならログインしていない事が分かる処理にした
        return true;
    } else {
        return false;
    }
}

//トップページ
router.get('/',(req,res,next) => {
    res.redirect('/boards/0');
});

/* paramsでクエリーパラメータを使う*/

/*トップページにページ番号をつけてアクセス
この番号を使い、一定数ごとのBoardを取り出して表示*/
router.get('/:page',(req, res, next)=> {
    if (check(req,res)){ return };
    /*ページ番号をpageパラメータから取り出して変数に代入
    整数にするために1をかける*/
    const pg = req.params.page * 1;
    db.Board.findAll({
        //値を取り出す位置を1ページ当たりの数*ページ数で得る
        offset: pg * pnum,
        //取り出す個数
        limit: pnum,
        //orderは配列を使って値を用意している。"createAt"は並び順の基準となる項目名。
        order: [
            ['createdAt', 'DESC']
        ],
        include: [{
            model: db.User,
            required: true
        }]
        }).then(brds => {
            var data = {
                title: 'Boards',
                login:req.session.login,
                content: brds,
                page:pg
            }
        res.render('boards/index', data);
    });
});

// メッセージフォームの送信処理
router.post('/add',(req, res, next)=> {
    if (check(req,res)){ return };
    db.sequelize.sync()
        .then(() => db.Board.create({
            userId: req.session.login.id,
            message:req.body.msg
        })
        .then(brd=>{
            res.redirect('/boards');
        })
        .catch((err)=>{
            res.redirect('/boards');
        })
    )
});

//利用者のホーム
router.get('/home/:user/:id/:page',(req, res, next)=> {
    if (check(req,res)){ return };
    const id = req.params.id * 1;
    const pg = req.params.page * 1;
    db.Board.findAll({
        where: {userId: id},
        offset: pg * pnum,
        limit: pnum,
        order: [
            ['createdAt', 'DESC']
        ],
        //Userのオブジェクトも合わせて取り出す
        include: [{
            model: db.User,
            required: true
        }]
    }).then(brds => {
        var data = {
            title: 'Boards',
            login:req.session.login,
            userId:id,
            userName:req.params.user,
            content: brds,
            page:pg
        }
        res.render('boards/home', data);
    });
});
module.exports = router;

