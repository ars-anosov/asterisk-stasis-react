'use strict';

var apiTools = require('../sub_modules/api_tools')

exports.apiAction = function(req, res, next) {

  var args                = req.swagger.params

  var respObj = {
    "nodes": [
      // Ringing to External
      {
        "idChannel": "core_fixed_01",
        "id": "core:Down: pgw_g729_g711a",
        "group": "core:Down",
        "size": 8
      },
      {
        "idChannel": "core_fixed_02",
        "id": "core:Up: pgw_g729_g711a",
        "group": "core:Up",
        "size": 8
      }
    ],
    "links": []
  }



  var chanObj = req.myObj.PlatformChannelsNow.channels
  var brObj = req.myObj.PlatformChannelsNow.bridges
  var nodesObj = {"core:Down: pgw_g729_g711a": 1, "core:Up: pgw_g729_g711a": 1,}

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
        'size':             idCustom.match(/pgw_/) ? 8 : 6
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