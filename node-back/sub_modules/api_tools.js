'use strict';

var apiResJson = function (res, resObj, statusCode) {
  var response = {};
  response['application/json'] = resObj;

  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');

  res.end(JSON.stringify(response[Object.keys(response)[0]] || {}, null, 2));
}









/** Генератор случайной строки
 * @param {int} n длинна строки
 */
var randWDclassic = function (n) {
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
var passHashGet = function (pass, salt, length) {
  var crypto = require('crypto');

  var sha = crypto.createHash('sha1');
  sha.update(pass+':)'+salt);           // собственные рецепт
  var token = sha.digest('base64');
  return token.substring(0, length);    // отрезаю символы = которые генерит алгоритм base64 node в отличие от perl
}









module.exports.apiResJson     = apiResJson
module.exports.randWDclassic  = randWDclassic
module.exports.passHashGet    = passHashGet
