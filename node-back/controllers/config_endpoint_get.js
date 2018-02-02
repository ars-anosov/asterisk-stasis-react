'use strict';

var apiTools = require('../sub_modules/api_tools')

exports.apiAction = function(req, res, next) {

  var args                = req.swagger.params
  var ariAsterClient      = req.myObj.ariAsterClient

  var jsonRespArr = []
  ariAsterClient.endpoints.list(function(err, endpoints) {
    endpoints.forEach(function(endpoint) {
      jsonRespArr.push({
        "technology":   endpoint.technology,
        "resource":     endpoint.resource,
        "state":        endpoint.state,
        "channel_ids":  endpoint.channel_ids
      })
    })

    apiTools.apiResJson(res, jsonRespArr, 200)
  })

  //apiTools.apiResJson(res, {code: 202, message: 'API - no actions'}, 202)

}