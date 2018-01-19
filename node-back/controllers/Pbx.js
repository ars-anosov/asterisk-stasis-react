'use strict';

var url = require('url');

var pbx_channels_state = require('./pbx_channels_state');





module.exports.channels_state = function channels_state(req, res, next) {
  pbx_channels_state.apiAction(req, res, next);
};
