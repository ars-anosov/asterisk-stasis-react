'use strict';

var m_chanlink_get    = require('./data_chanlink_get')




module.exports.chanlink_get = function chanlink_get(req, res, next) {
  m_chanlink_get.apiAction(req, res, next)
}