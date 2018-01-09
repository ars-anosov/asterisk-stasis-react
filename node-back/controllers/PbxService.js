'use strict';

exports.channelsState = function(args, res, next) {
  /**
   * Выводит активные каналы
   *
   * direction String Направление вызова (in/out) (optional)
   * returns List
   **/

  var ariAsterClient = res.ariAsterClient;

  var objToSwag = {};
  objToSwag['application/json'] = [];
  var ariAsterClient = res.ariAsterClient;    // Коннект к ARI-интерфейсу астериска
  
  // my logic -----------------------------
  
  var strToWS = '';
  
  //res.ariAsterClient.channels.list(function(err, channels) {
  ariAsterClient.channels.list(function(err, channels) {
    if (channels.length) {
  
      strToWS = '';
      channels.forEach(function(channel) {
        strToWS += '['+channel.caller.number+'] >>> ['+channel.dialplan.exten+']   id: '+channel.id+'   name: '+channel.name+'   state: '+channel.state+'\n';
  
        objToSwag['application/json'].push(
          {
            "id" : channel.id,
            "dialplan_exten" : channel.dialplan.exten,
            "name" : channel.name,
            "state" : channel.state,
            "caller_number" : channel.caller.number
          }
        );
  
      });
  
      // отдаю через свой WS
      if (res.wsServerConn.host) { res.wsServerConn.sendText( 'Активные каналы:\n' + strToWS ); }
  
    }
  
  
    else {
      objToSwag['application/json'] = 'all channels free';
    }
  
    res.setHeader('Content-Type', 'application/json');
    res.end( JSON.stringify(objToSwag['application/json'] || {}, null, 2) );
  
  });

  
}

