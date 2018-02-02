'use strict';

var m_endpoint_get    = require('./config_endpoint_get')
var m_endpoint_post   = require('./config_endpoint_post')
var m_endpoint_put    = require('./config_endpoint_put')
var m_endpoint_del    = require('./config_endpoint_del')






module.exports.endpoint_get = function endpoint_get(req, res, next) {
  m_endpoint_get.apiAction(req, res, next)
}
module.exports.endpoint_post = function endpoint_post(req, res, next) {
  m_endpoint_post.apiAction(req, res, next)
}
module.exports.endpoint_put = function endpoint_put(req, res, next) {
  m_endpoint_put.apiAction(req, res, next)
}
module.exports.endpoint_del = function endpoint_del(req, res, next) {
  m_endpoint_del.apiAction(req, res, next);
}
