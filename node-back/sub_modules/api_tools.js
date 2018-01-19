'use strict';

module.exports.mysqlAction = function mysqlAction(mysqlPool, sqlStr, callback) {
  // pool.query() is shortcut for pool.getConnection() + connection.query() + connection.release()
  // https://github.com/mysqljs/mysql/issues/1202
  mysqlPool.query(
    sqlStr,
    function (err, result, fields) {
      if (err) { throw err; }
      callback(result)
    }
  );
}









module.exports.apiResEnd = function apiResponse(res, resObj, statusCode) {
  var response = {};
  response['application/json'] = resObj;

  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');

  res.end(JSON.stringify(response[Object.keys(response)[0]] || {}, null, 2));
}

module.exports.apiResJson = function apiResJson(res, resObj, statusCode) {
  var response = {};
  response['application/json'] = resObj;

  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');

  res.end(JSON.stringify(response[Object.keys(response)[0]] || {}, null, 2));
}









/** Генератор случайной строки
 * @param {int} n длинна строки
 */
module.exports.randWDclassic = function randWDclassic(n) {
  var s ='', abd ='abcdefghijklmnopqrstuvwxyz0123456789', aL = abd.length;
  while(s.length < n)
    s += abd[Math.random() * aL|0];
  return s;
}









/** Генератор sha1-base64 hash
 * @param {string} pass пароль
 * @param {string} salt соль
 * @param {int} length длинна hash. Нужна чтобы отрезать "=" в конце
 */
module.exports.passHashGet = function passHashGet(pass, salt, length) {
  var crypto = require('crypto');

  var sha = crypto.createHash('sha1');
  sha.update(pass+':)'+salt);           // собственные рецепт
  var token = sha.digest('base64');
  return token.substring(0, length);    // отрезаю символы = которые генерит алгоритм base64 node в отличие от perl
}
