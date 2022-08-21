const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const url = require('url');
const qs = require('querystring');


const index_page = fs.readFileSync('./index.ejs', 'utf8');
const other_page = fs.readFileSync('./other.ejs', 'utf-8');
const style_css = fs.readFileSync('./style.css', 'utf8');


var server = http.createServer(getFromClient);


server.listen(3000);
console.log('Server startin!!');


//ここまでメインプログラム


//createServerの処理
function getFromClient(req,res) {

    var url_parts = url.parse(req.url, true);
    switch (url_parts.pathname) {

        case '/':
            res_index(req,res);
            break;
        
        case '/other':
            res_other(req,res);
            break;

        case '/style.css':
            res.writeHead(200, {'Container-Type': 'text/css'});
            res.write(style_css);
            res.end();
            break;

        default:
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('no page...');
            break;
    }
}


//追加するデータ用変数
var data = { msg: 'no message...'};

var data2 = {
    'Taro' : ['taro@yamada','09-999-999','Tokyo'],
    'Hanako': ['hanako@flower','080-888-888','Yokohama'],
    'Sachiko':['sachi@happy','070-777-777','Nagoya'],
    'Ichiro':['ichi@baseball','060-666-666','USA'],
}


//indexのアクセス処理
function res_index(req,res) {
    //POSTアクセス時の処理
    if (req.method == 'POST') {
        var body = '';

        //データ受信のイベント処理
        req.on('data',(data) =>{
            body += data;
        });

        //データ受信終了のイベント処理
        req.on('end',() => {
            data = qs.parse(body); //データのパース
            //クッキーの保存
            setCookie('msg', data.msg, res);
            write_index(req,res);
        });
    } else {
        write_index(req,res);
    }
}

//indexのページ作成
function write_index(req,res) {
    var msg = "※伝言を表示します。"
    var cookie_data = getCookie('msg',req);
    var content = ejs.render(index_page, {
        title: "Index",
        content: msg,
        data: data,
        cookie_data: cookie_data,
    });
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(content); 
    res.end();
}

//クッキーの値を設定
function setCookie(key, value, res) {
    var cookie = escape(value);
    res.setHeader('Set-Cookie', [key + '=' + cookie]);
}
//クッキーの値を取得
function getCookie(key, req) {
    var cookie_data = req.headers.cookie != undefined?  //三項演算子:条件と2つの値の計3個の要素で構成されている
        req.headers.cookie: '';                         //最初の条件がtrueなら1つ目の値、falseなら２つ目の値が得られる
    var data = cookie_data.split(';');
    for (var i in data) {
        if (data[i].trim().startsWith(key + '=')) {
            var result = data[i].trim().substring(key.length +1);
            return unescape(result);
        }
    }
    return '';
}


//otherのアクセス処理
function res_other(req,res) {
    var msg = "This is an Other page."
    var content = ejs.render(other_page,{
        title: "Other",
        content: msg,
        data: data2,
        filename: 'data_item'
    });
    res.writeHead(200, { 'Content-Type': 'text/html'});
    res.write(content);
    res.end();

    //POSTアクセス時の処理
    if (req.method == 'POST') {
        var body = '';

        //データ受信のイベント処理
        req.on('data', (data) => {
            body += data;
        });

        //データ受信終了のイベント処理
        req.on('end', () => {
            var post_data = qs.parse(body);
            msg += 'あなたは、「'+ post_data.msg +'」と書きました。';
            var content = ejs.render(other_page, {
                title: "Other",
                content: msg,
            }); 
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(content);
            res.end() 
        });

     //GETアクセス時処理  
    } else {
        var msg = "ページがありません";
        var content = ejs.render(other_page, {
            title: "Other",
            content: msg,
        }); 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(content);
        res.end() 
    }
}


/*
    [Node.jsでのwebページ表示の基本]
    1.requireでhttpオブジェクトを用意
    2.createServerでサーバーを作る
    3.listenで待ち受け開始する
    [ejsオブジェクトの基本]
    1.rquireでejsオブジェクトを読み込む
    2.fs.readFileSyncオブジェクトでテンプレートファイルを読み込む ※sync(同期)→名詞
    3.renderメソッドでHTMLのソースコードに変換（レンダリング）
    [ルーティングの基本]
    1.request.urlの値を取り出す
    2.url.parseでパースして得られたオブジェクトからpathnameでパスを取り出す
    3.その値に応じて処理を作成
 */