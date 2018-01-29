'use strict';

var apiTools = require('../sub_modules/api_tools');

exports.apiAction = function(req, res, next) {

  var channelsObj = {};
  var respObj = [];

  req.myObj.coreShowChannelsObj.map( (row, i) => {
    channelsObj[row.channel] = {
      uniqueid:           row.uniqueid,
      context:            row.context,
      extension:          row.extension,
      priority:           row.priority,
      channelstate:       row.channelstate,
      channelstatedesc:   row.channelstatedesc,
      application:        row.application,
      applicationdata:    row.applicationdata,
      calleridnum:        row.calleridnum,
      calleridname:       row.calleridname,
      connectedlinenum:   row.connectedlinenum,
      connectedlinename:  row.connectedlinename,
      duration:           row.duration,
      accountcode:        row.accountcode,
      bridgedchannel:     row.bridgedchannel,
      bridgeduniqueid:    row.bridgeduniqueid
    }
  })



  req.myObj.coreShowChannelsObj.map( (row, i) => {
    // SIP/0001106-000008f2
    // SIP/intellin-000008f3
    
    //var rm = new RegExp ('^SIP\/000'+req.myObj.auth.vpbx);
    //if ( row.accountcode == req.myObj.auth.vpbx || row.channel.match(rm) || row.bridgedchannel.match(rm) ) {
      //console.log(row)

      var direction = '';

      if (row.context == 'office' && row.application == 'AppDial')  { direction = 'office-in' }
      if (row.context == 'office' && row.application == 'Dial')     { direction = 'office-out' }

      if (row.context == 'trunkinbound' && row.application == 'AppDial')  { direction = 'trunk-out' }
      if (row.context == 'trunkinbound' && row.application == 'Dial')     { direction = 'trunk-in' }
      if (row.context == 'trunkinbound' && row.application == 'AGI')      { direction = 'trunk-in' }
      
      respObj.push({
        sip_tg:             row.channel.substr(6, row.channel.length - 6 - 9),
        application:        row.application,
        context:            row.context,
        extension:          row.extension,
        channelstatedesc:   row.channelstatedesc,
        calleridnum:        row.calleridnum,
        connectedlinenum:   row.connectedlinenum,
        duration:           row.duration,

        b_sip_tg:             row.bridgedchannel ? row.bridgedchannel.substr(6, row.bridgedchannel.length - 6 - 9): '',
        b_application:        row.bridgedchannel ? channelsObj[row.bridgedchannel].application : '',
        b_context:            row.bridgedchannel ? channelsObj[row.bridgedchannel].context : '',
        b_extension:          row.bridgedchannel ? channelsObj[row.bridgedchannel].extension : '',
        b_channelstatedesc:   row.bridgedchannel ? channelsObj[row.bridgedchannel].channelstatedesc : '',
        b_calleridnum:        row.bridgedchannel ? channelsObj[row.bridgedchannel].calleridnum : '',
        b_connectedlinenum:   row.bridgedchannel ? channelsObj[row.bridgedchannel].connectedlinenum : '',
        b_duration:           row.bridgedchannel ? channelsObj[row.bridgedchannel].duration : '',

        call_direction:       direction
      });

    //}
    
  })
  
  apiTools.apiResEnd(res, respObj, 200);

}
