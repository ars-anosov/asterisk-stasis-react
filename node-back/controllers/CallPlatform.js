'use strict';

var url = require('url');

var CallPlatform = require('./CallPlatformService');

module.exports.originateCallList = function originateCallList (req, res, next) {
  CallPlatform.originateCallList(req.swagger.params, res, next);
};
