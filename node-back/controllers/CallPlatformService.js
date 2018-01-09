'use strict';

exports.originateCallList = function(args, res, next) {
  /**
   * Делаем набор с кучи endpoint на кучу exten ```json {    \"endpoint\": [       \"PJSIP/509\"     ],     \"exten\": [       \"74957856400\",       \"74957856400\"     ] } ``` 
   *
   * originateParam InOriginateListObj JSON объект содержащий [массив-endpoint], context, [массив-exten]
   * returns statusPost
   **/

  var objToSwag = {};
  objToSwag['application/json'] = [];
  var ariAsterClient = res.ariAsterClient;    // Коннект к ARI-интерфейсу астериска

  var candidates = {};                            // хэш {endpoints: channelId} и {channelId: endpoints}
  var myBridges = {};                             // хэш {channelId: channelId}
  var endpointIddle = [];             // свободные endpoints из списка originateParam 
  var endpointBussy = {};             // занятые в данный момент endpoints


/*

{
   "endpoint": [
      "509",
      "506",
      "523"
    ],
    "exten": [
      "79252008783",
      "79262129081",
      "79778103370",
      "78007756400",
      "78007756400",
      "78007756400"
    ]
}

*/


  



  // (+) Events -----------------------------------------------------------------------------------
  ariAsterClient.on('ChannelStateChange', function (event, channel) {
    if (res.wsServerConn.host) { res.wsServerConn.sendText( '{"type": "'+ event.type+'", "channelId": "'+channel.id+'", "channelName": "'+channel.name+'", "channelState": "'+event.channel.state+'"}' ); }
  });
  
  ariAsterClient.on('ChannelCreated', function (event, channel) {
    if (res.wsServerConn.host) { res.wsServerConn.sendText( '{"type": "'+ event.type+'", "channelId": "'+channel.id+'", "channelName": "'+channel.name+'"}' ); }
  });
  
  ariAsterClient.on('ChannelDestroyed', function (event, channel) {
    if (res.wsServerConn.host) { res.wsServerConn.sendText( '{"type": "'+ event.type+'", "channelId": "'+channel.id+'", "channelName": "'+channel.name+'"}' ); }
    chanDestroy(channel);
  });
  
  ariAsterClient.on('ChannelEnteredBridge', function (event, obj) {
    if (res.wsServerConn.host) { res.wsServerConn.sendText( '{"type": "'+ event.type+'", "bridgeId": "'+event.bridge.id+'"'+', "channels": ['+event.bridge.channels+']}' ); }
  });
  
  ariAsterClient.on('ChannelLeftBridge', function (event, obj) {
    if (res.wsServerConn.host) { res.wsServerConn.sendText( '{"type": "'+ event.type+'", "bridgeId": "'+event.bridge.id+'"'+', "channels": ['+event.bridge.channels+']}' ); }
  });

  
  ariAsterClient.on('StasisStart', stasisStart);
  ariAsterClient.on('StasisEnd', stasisEnd);

  ariAsterClient.start('stasis-ars-test');
  ariAsterClient.start('stasis-ars-test2');




  function chanDestroy(channel) {
    
    var endpoint = candidates[channel.id];
    if (endpoint) {
      candidates[endpoint] = '';
      delete candidates[channel.id];
      //console.log('destroyed: '+endpoint);
    }

    var channel2Id = myBridges[channel.id];
    if (channel2Id) {
      //console.log('остался потеряный канал: '+channel2Id);
      ariAsterClient.channels.hangup(
        {'channelId': channel2Id},
        function (err) {
        }
      );    
    }

    delete myBridges[channel.id];
    delete myBridges[channel2Id];

  }


  function stasisStart(event, channel) {

    //if (res.wsServerConn) { res.wsServerConn.sendText( '{"type": "'+ event.type+'", "application": "'+event.application+'", "channelId": "'+channel.id+'", "channelName": "'+channel.name+'", "leg1": "'+event.args[0]+'", "leg2": "'+event.args[1]+'"}' ); }
    
    switch(event.application) {

      // Leg1 ответил
      case 'stasis-ars-test':

        var endpointStr = event.args[1];

        ariAsterClient.channels.originate(
        {
          'endpoint': endpointStr,     //  leg 2 create adn originate
          'app': 'stasis-ars-test2',
          'appArgs':
            event.args[0]+','+    // leg1Endpoint
            endpointStr+','+      // leg2Endpoint
            channel.id            // leg1Id
          ,
          'callerId': 'call platform'
        },
        function (err, channel2) {
          
          myBridges[channel.id] = channel2.id;
          myBridges[channel2.id] = channel.id;
          
          var wsResObj = {
            'type':        "Originate",
            'channelId':   channel2.id,
            'channelName': channel2.name,
            'leg2':        endpointStr
          }
          if (res.wsServerConn.host) { res.wsServerConn.sendText( JSON.stringify(wsResObj) ); }
        }
        );

      break;

      // Leg2 ответил
      case 'stasis-ars-test2':
          
          ariAsterClient.bridges.create(
            function (err, bridge) {
              
            bridge.addChannel({
                bridgeId: bridge.id,
                channel: event.args[2]       // leg 1 - channel id
              });
              
            bridge.addChannel({
                bridgeId: bridge.id,
                channel: channel.id          // leg 2 - channel id
              });

            }
          );

      break;

    }

  }





  function stasisEnd(event, channel) {
    //if (res.wsServerConn) { res.wsServerConn.sendText( '{"type": "'+ event.type+'", "application": "'+event.application+'", "channelId": "'+channel.id+'", "channelName": "'+channel.name+'"}' ); }
  }

  // (-) Events -----------------------------------------------------------------------------------



















  
  



  // start
  // (1) --------------------------------------------
  
  

  console.log('\nSTART ------------------');
  //console.log(candidates);
  //res.ariAsterClient.channels.list(onChannelsListReady);
  ariAsterClient.channels.list(onChannelsListReady);

  // Повторяем раз в минуту, пока не кончатся originateParam.exten
  var timerId = setInterval(function() {                    // !!!!!!!!!!
    //console.log(args.originateParam.value.exten.length);
    //res.ariAsterClient.channels.list(onChannelsListReady);
    ariAsterClient.channels.list(onChannelsListReady);
  }, 5000);

  // Защита (работаем не больше минуты)
  //setTimeout(function() {
  //  console.log('STOP 60 sec Limit ------------------');
  //  clearInterval(timerId);
  // 
  //}, 60000);




  
  // (1 - ready)
  function onChannelsListReady(err, channels) {

    endpointBussy = {};

    for (var i in channels) {
      var result = channels[i].name.match( /^(SIP\/\d\d\d)\-.*/ );
      //var result = channels[i].name.match( /^(PJSIP\/\d\d\d)\-.*/ );
      //console.log(result[1]+': '+channels[i].name+' state:'+channels[i].state);

      if (result) { endpointBussy[result[1]] = channels[i].state; }
    }

    // (2)
    selectEndpoints(endpointBussy, onSelectEndpointsReady);
  }



  // (2) --------------------------------------------
  function selectEndpoints(endpointBussyArr, callBack) {
    
    var endpointOriginateArr = args.originateParam.value.endpoint;  // запрошены в originateParam
    endpointIddle = [];

    for (var i in endpointOriginateArr) {
      var endpointName = 'SIP/'+endpointOriginateArr[i];
      //var endpointName = 'PJSIP/'+endpointOriginateArr[i];
      
      // не занят, не кандидат
      //if (!endpointBussyArr[endpointName] && !res.candidates[endpointName]) {
      if (!endpointBussyArr[endpointName] && !candidates[endpointName]) {
        endpointIddle.push(endpointName);
      }
    }

    callBack(endpointIddle);
  }

  // (2 - ready)
  function onSelectEndpointsReady(endpointArr) {

    endpointArr.forEach(originateLeg1);

  }


  // (3) --------------------------------------------
  function originateLeg1(item, i, arr) {

    // если еще остались элементя в Leg2
    if (args.originateParam.value.exten.length > 0) {
      var extenNumber = args.originateParam.value.exten.shift();
      var endpointStr = 'SIP/'+extenNumber+'@pgw_5301';
      //var endpointStr = 'PJSIP/0000'+extenNumber+'@pgw_g729_g711a';
      
      //res.ariAsterClient.channels.originate(
      ariAsterClient.channels.originate(
        {
          'endpoint': endpointStr,
          'app': 'stasis-ars-test',
          'appArgs':
            endpointStr+','+    // leg1Endpoint
            item          // leg2Endpoint
          ,
          'callerId': '74957856500'
        },
        function (err, channel) {

          console.log(endpointStr);
          
          // leg2-endpoint: leg1-channelId
          //res.candidates[item] = channel.id;
          candidates[item] = channel.id;
          // leg1-channelId: leg2-endpoint
          //res.candidates[channel.id] = item;
          candidates[channel.id] = item;

          var wsResObj = {
            'type':     "Originate",
            'channelId':  channel.id,
            'channelName':  channel.name,
            'leg1':     endpointStr
          }
          if (res.wsServerConn.host) { res.wsServerConn.sendText( JSON.stringify(wsResObj) ); }
        }
      );
    
    }
    
    else {
      console.log('END --------------------');
      clearInterval(timerId);
    }

  }





  // отдаю через swagger API --------------------------------------------------------
  objToSwag['application/json'] = 'action Ok';
  res.setHeader('Content-Type', 'application/json');
  res.end( JSON.stringify(objToSwag['application/json'] || {}, null, 2) );

}

