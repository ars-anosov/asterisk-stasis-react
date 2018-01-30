'use strict';

var PlatformChannels = function(ariAsterClient, cb) {
  var chanObj = {}
  var bridgObj = {}
  if (ariAsterClient) {
    ariAsterClient.channels.list(function(err, channels) {
      ariAsterClient.bridges.list(function(err, bridges) {

        channels.forEach(function(channel) {
          chanObj[channel.id] =
          {
            "id":           channel.id,
            "name":         channel.name,
            "state":        channel.state,
            "caller": {
              "name":         channel.caller.name,
              "number":       channel.caller.number
            },
            "connected": {
              "name":         channel.connected.name,
              "number":       channel.connected.number
            },
            "accountcode":  channel.accountcode,
            "dialplan": {
              "context":      channel.dialplan.context,
              "exten":        channel.dialplan.exten,
              "priority":     channel.dialplan.priority
            },
            "creationtime": channel.creationtime,
            "language":     channel.language
          }
        })

        bridges.forEach(function(bridge) {

          // bridge.channels массив channelId меняю на массив объектов channels[channelId]
          bridge.channels.map((chanIdOnBridge, i) => {
            if (chanObj[chanIdOnBridge]) {
              bridge.channels[i] = chanObj[chanIdOnBridge]
            }
            else {
              bridge.channels[i] = {'id': chanIdOnBridge}
            }
          })

          bridgObj[bridge.id] =
          {
            "id":           bridge.id,
            "technology":   bridge.technology,
            "bridge_type":  bridge.bridge_type,
            "bridge_class": bridge.bridge_class,
            "creator":      bridge.creator,
            "name":         bridge.name,
            "channels":     bridge.channels,
            "video_mode":   bridge.video_mode
          }
        })

        // CallBack results
        cb(chanObj, bridgObj)

      })
    })
  }

}









module.exports.PlatformChannels   = PlatformChannels
