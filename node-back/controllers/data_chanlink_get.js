'use strict';

var apiTools = require('../sub_modules/api_tools')

exports.apiAction = function(req, res, next) {

  var args                = req.swagger.params

  var respObj = {
    "nodes": [
      // Ringing to External
      {
        "idChannel": "test_id_01",
        "id": "core:Down: pgw_g729_g711a",
        "group": "core:Down",
        "size": 8
      },
      {
        "idChannel": "test_id_02",
        "id": "office:Ring: 1504 -> 79252001234",
        "group": "office:Ring",
        "size": 6
      },
      // Speech to External
      {
        "idChannel": "test_id_03",
        "id": "core:Up: pgw_g729_g711a",
        "group": "core:Up",
        "size": 8
      },
      {
        "idChannel": "test_id_04",
        "id": "office:Up: 1501 -> 74957856401",
        "group": "office:Up",
        "size": 6
      },
      {
        "idChannel": "test_id_05",
        "id": "office:Up: 1502 -> 74957856402",
        "group": "office:Up",
        "size": 6
      },
      // Ring to local
      {
        "idChannel": "test_id_06",
        "id": "office:Ringing: 1506",
        "group": "office:Ringing",
        "size": 6
      },
      {
        "idChannel": "test_id_07",
        "id": "office:Ring: 1505 -> 1506",
        "group": "office:Ring",
        "size": 6
      }
    ],
    "links": [
      // Ringing to External
      {
        "value": 1,
        "source": "office:Ring: 1504 -> 79252001234",
        "target": "core:Down: pgw_g729_g711a"
      },
      // Speech to External
      {
        "value": 1,
        "source": "office:Up: 1501 -> 74957856401",
        "target": "core:Up: pgw_g729_g711a"
      },
      {
        "value": 1,
        "source": "office:Up: 1502 -> 74957856402",
        "target": "core:Up: pgw_g729_g711a"
      },
      // Ring to local
      {
        "value": 1,
        "source": "office:Ring: 1505 -> 1506",
        "target": "office:Ringing: 1506"
      }
    ]
  }



  var chanObj = req.myObj.PlatformChannelsNow.channels
  var brObj = req.myObj.PlatformChannelsNow.bridges
  var nodesObj = {"core:Up: pgw_g729_g711a": 1, "core:Down: pgw_g729_g711a": 1}

  if (args.layer.value) {
    //console.log('layer:' + args.layer.value)
  }

  function idCustomCreate(channel) {
    return groupCustomCreate(channel)+': ' + channel.name.substr(6, channel.name.length - 6 - 9) + (channel.dialplan.exten === 's' ? '' : ' -> '+channel.dialplan.exten)
  }
  function groupCustomCreate(channel) {
    let contextName = channel.dialplan.context
    
    if (channel.dialplan.context === 'from-internal') { contextName = 'office' }
    if (channel.dialplan.context === 'from-external') { contextName = 'public' }
    if (channel.dialplan.context === 'no_context')    { contextName = 'core' }
    
    return contextName+':'+channel.state
  }

  for (let key in chanObj) {
    let idCustom = idCustomCreate(chanObj[key])
    if (!(nodesObj[idCustom] === 1)) {
      respObj.nodes.push({
        'id':               idCustom,
        'idChannel':        chanObj[key].id,
        'group':            groupCustomCreate(chanObj[key]),
        'size':             idCustom.match(/pgw/) ? 8 : 6
      })
      nodesObj[idCustom] = 1
    }
  }

  for (let key in brObj) {
    respObj.links.push({
      'value':            1,
      'source':           idCustomCreate(brObj[key].channels[0]),
      'target':           idCustomCreate(brObj[key].channels[1])
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