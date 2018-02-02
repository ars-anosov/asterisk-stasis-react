'use strict';

var apiTools = require('../sub_modules/api_tools')

exports.apiAction = function(req, res, next) {

  var args                = req.swagger.params
  
  apiTools.apiResJson(res, {code: 202, message: 'API - no actions'}, 202)

}