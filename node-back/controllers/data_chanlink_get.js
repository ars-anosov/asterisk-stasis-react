'use strict';

var apiTools = require('../sub_modules/api_tools')

exports.apiAction = function(req, res, next) {

  var args                = req.swagger.params

  var respObj = {
    "nodes": [
      // Ringing to External
      {
        "id": "Down: pgw_g729_g711a",
        "group": "Down",
        "desc": "8"
      },
      {
        "id": "Ring: 1504 -> 79252001234",
        "group": "Ring",
        "desc": "6"
      },
      // Speech to External
      {
        "id": "Up: pgw_g729_g711a",
        "group": "Up",
        "desc": "8"
      },
      {
        "id": "Up: 1501 -> 74957856401",
        "group": "Up",
        "desc": "6"
      },
      {
        "id": "Up: 1502 -> 74957856402",
        "group": "Up",
        "desc": "6"
      },
      // Ring to local
      {
        "id": "Ringing: 1506",
        "group": "Ringing",
        "desc": "6"
      },
      {
        "id": "Ring: 1505 -> 1506",
        "group": "Ring",
        "desc": "6"
      }
    ],
    "links": [
      // Ringing to External
      {
        "value": 1,
        "source": "Ring: 1504 -> 79252001234",
        "target": "Down: pgw_g729_g711a"
      },
      // Speech to External
      {
        "value": 1,
        "source": "Up: 1501 -> 74957856401",
        "target": "Up: pgw_g729_g711a"
      },
      {
        "value": 1,
        "source": "Up: 1502 -> 74957856402",
        "target": "Up: pgw_g729_g711a"
      },
      // Ring to local
      {
        "value": 1,
        "source": "Ring: 1505 -> 1506",
        "target": "Ringing: 1506"
      }
    ]
  }





  var chanObj = req.myObj.PlatformChannelsNow.channels
  var brObj = req.myObj.PlatformChannelsNow.bridges
  var nodesObj = {"Up: pgw_g729_g711a": 1, "Down: pgw_g729_g711a": 1}

  if (args.layer.value) {
    //console.log('layer:' + args.layer.value)
  }

  for (let key in chanObj) {
    let idCustom = chanObj[key].state +': '+ chanObj[key].name.substr(6, chanObj[key].name.length - 6 - 9) + (chanObj[key].dialplan.exten === 's' ? '' : ' -> '+chanObj[key].dialplan.exten)
    if (!(nodesObj[idCustom] === 1)) {
      respObj.nodes.push({
        'id':               idCustom,
        'group':            chanObj[key].state,
        'desc':             idCustom.match(/pgw/) ? '8' : '6'
      })
      nodesObj[idCustom] = 1
    }
  }

  for (let key in brObj) {
    let idCustom0 = brObj[key].channels[0].state +': '+ brObj[key].channels[0].name.substr(6, brObj[key].channels[0].name.length - 6 - 9) + (brObj[key].channels[0].dialplan.exten === 's' ? '' : ' -> '+ brObj[key].channels[0].dialplan.exten)
    let idCustom1 = brObj[key].channels[1].state +': '+ brObj[key].channels[1].name.substr(6, brObj[key].channels[1].name.length - 6 - 9) + (brObj[key].channels[1].dialplan.exten === 's' ? '' : ' -> '+ brObj[key].channels[1].dialplan.exten)
    respObj.links.push({
      'value':            1,
      'source':           idCustom0,
      'target':           idCustom1
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