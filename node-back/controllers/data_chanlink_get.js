'use strict';

var apiTools = require('../sub_modules/api_tools')

exports.apiAction = function(req, res, next) {

  var args                = req.swagger.params

  var respObj = {'nodes': [], 'links': []}
  var chanObj = req.myObj.PlatformChannelsNow.channels
  var brObj = req.myObj.PlatformChannelsNow.bridges

  if (args.layer.value) {
    console.log('layer:' + args.layer.value)
  }

  for (let key in chanObj) {
    respObj.nodes.push({
      'id':               chanObj[key].name,
      'group':            0
    })
  }

  for (let key in brObj) {
    respObj.links.push({
      'value':            1,
      'source':           brObj[key].channels[0].name,
      'target':           brObj[key].channels[1].name
    })
  }

  apiTools.apiResJson(res, respObj, 200);
}


/*
{ channels:
   { '1517308815.123':
      { id: '1517308815.123',
        name: 'PJSIP/509-0000007b',
        state: 'Ring',
        caller: [Object],
        connected: [Object],
        accountcode: '',
        dialplan: [Object],
        creationtime: '2018-01-30T10:40:15.945+0000',
        language: 'en' },
     '2eafc43f-6431-4ee9-ada8-ff73d2a2efcd':
      { id: '2eafc43f-6431-4ee9-ada8-ff73d2a2efcd',
        name: 'PJSIP/pgw_g729_g711a-0000007c',
        state: 'Down',
        caller: [Object],
        connected: [Object],
        accountcode: '',
        dialplan: [Object],
        creationtime: '2018-01-30T10:40:15.960+0000',
        language: 'en' } },
  bridges:
   { '9dce86db-3b62-4def-9280-be24b099b708':
      { id: '9dce86db-3b62-4def-9280-be24b099b708',
        technology: 'simple_bridge',
        bridge_type: 'mixing',
        bridge_class: 'stasis',
        creator: 'Stasis',
        name: '',
        channels: [Array],
        video_mode: 'talker' } } }
*/