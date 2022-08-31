const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const url = require('url');
const qs = require('querystring');


const index_page = fs.readFileSync('./index.ejs', 'utf8');
const login_page = fs.readFileSync('./login.ejs', 'utf8');


const max_num = 10; // 最大保管数
const filename = 'mydata.txt'; // データファイル名
var message_data; // データ
readFromFile(filename);


var server = http.createServer(getFromClient);


server.listen(3000);
console.log('Server start!');


//ここまでメインプログラム===========================


// createServerの処理
function getFromClient(req, res) {
    var url_parts = url.parse(req.url, true);
    switch (url_parts.pathname) {
        case '/': // トップページ（メッセージボード）
            res_index(req, res);
            break;
        case '/login': // ログインページ
            res_login(req, res);
            break;
        default:
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('no page...');
            break;
    }
}


//loginのアクセス処理
function res_login(req,res) {
    var content = ejs.render(login_page, {});
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(content);
    res.end();
}


//indexのアクセス処理
function res_index(req,res) {
    //POSTアクセス時の処理
    if(req.method == 'POST') {
        var body = '';

        //データ受信のイベント処理
        req.on('data',function(data) {
        body += data;
        }) ;

        //データ受信終了のイベント処理
        req.on('end', function(){
            data = qs.parse(body);
            addToData(data.id, data.msg, filename, req);
            write_index(req,res);
        });
    } else {
        write_index(req,res);
    }
}


//indexのページ作成
function write_index(req, res) {
    var msg = "※何かメッセージを書いて下さい。";
    var content = ejs.render(index_page, {
        title: 'Index',
        content: msg,
        data: message_data,
        filename: 'data_item',
    });
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(content);
        res.end();
}


//テキストファイルをロード
function readFromFile(fname) {
    fs.readFile(fname, 'utf-8',(err,data) => {
        message_data = data.split('\n');
    })
}

//データを更新
function addToData(id, msg, fname, req) {
    var obj = {'id': id, 'msg':msg};
    var obj_str = JSON.stringify(obj);
    console.log('add data: ' + obj.str);
    message_data.unshift(obj_str);
    if(message_data.length > max_num) {
        message_data.pop();
    }
    saveToFilename(fname);
}


//データを保存
function saveToFilename(fname) {
    var data_str = message_data.join('\n');
    fs.writeFile(fname, data_str, (err) => {
        if (err) { throw err; }
    });
}

/*
5 querystringとは?
29 req,resのイメージが出来ていない
58 req.method == 'POST' この仕組みがよくわかってない
95 err とは?
103 stringify?
105 unshift?
117 throw?
*/