var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) { //route.get(アドレス,関数);
  res.render('index', { title: 'Express' });
});

module.exports = router;
