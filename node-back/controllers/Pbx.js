'use strict';

var url = require('url');

var Pbx = require('./PbxService');

module.exports.channelsState = function channelsState (req, res, next) {
  Pbx.channelsState(req.swagger.params, res, next);
};
