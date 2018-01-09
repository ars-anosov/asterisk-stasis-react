'use strict';

// https://www.zabbix.com/documentation/3.2/manual/api/reference/hostgroup/get

var apiTools = require('../sub_modules/api_tools')

exports.apiAction = function(req, res, next) {

  var args                = req.swagger.params
  
  var request             = req.myObj.request.module
  var reqOptions          = req.myObj.request.reqOptions

  var json_request = {
    "jsonrpc": "2.0",
    "method": "hostgroup.get",
    "params": {
      "output": [
        "groupid",
        "name"
      ],
      "filter": {
        "groupid": [],
        "name": []
      }
    },
    "id": 2,
    "auth": req.myObj.request.auth
  }

  if (args.name.value) {
    json_request.params.filter.name.push(args.name.value)
  }




  if (json_request.id) {
    reqOptions.body = JSON.stringify(json_request)
    console.log(reqOptions)

    request(reqOptions, function(requestErr, requestRes, requestBody) {
      var requestBodyJson = JSON.parse(requestBody)
      console.log(requestBodyJson)

      if (requestBodyJson.result) {
        apiTools.apiResJson(res, requestBodyJson.result, 200)
      }
      else {
        apiTools.apiResJson(res, {code: 202, message: 'Zabbix error: '+requestBodyJson.error.data}, 202)
      }
    });
  }
  else {
    apiTools.apiResJson(res, {code: 202, message: 'API - no actions'}, 202)
  }

}