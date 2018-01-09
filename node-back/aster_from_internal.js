'use strict';

var dateFormat = require('dateformat');
var datetimeNow = new Date();


module.exports.Stasis = function(ariAsterClient, stasisName, mysqlConnection) {

	// API for Stasis Object
	var self = this;
	
	// Этот объект наполнится из index.js когда там стартует WS-Server
	this.wsServerConn = {};
	
	// Стартую новое приложение на астериске
	this.appStart = function() {
		ariAsterClient.start(stasisName);
	}





	// (+) stasisStart ------------------------------------------------------------------
	this.stasisStart = function (event, channel) {
		if (self.wsServerConn.headers) { self.wsServerConn.sendText( JSON.stringify(event || {}, null, 2) ); }
		
		// channel - first channel
		// dialed - second channel
		
		if (event.args[0] === 'leg2') {
			console.log('stasisStart (2) ----------------------> 2nd leg dialed. (channel: '+channel.id+' '+channel.name+')');
		}
		else if (channel.dialplan.exten === 'h') {
			console.log('stasisStart (3) ----------------------> Hangup request. (channel: '+channel.id+' '+channel.name+')');
		}
		else {
			console.log('stasisStart (1) ----------------------> Create 2nd leg. (channel: '+channel.id+' '+channel.name+')');
			// построить второе плече ( dialed )
			
			//playbackFile(channel, 'sound:pls-hold-while-try', onPlaybackFinished);
			getDataFromMysql(channel, onMysqlDataReady);
		}

		





		function playbackFile(channel, sound, callback /* calback(channel) */) {
			var playback = ariAsterClient.Playback();

			playback.on('PlaybackStarted', function (event, playback) {
				if (self.wsServerConn.headers) { self.wsServerConn.sendText( JSON.stringify(event || {}, null, 2) ); }
			});

			playback.on('PlaybackFinished', function (event, playback) {
				if (self.wsServerConn.headers) { self.wsServerConn.sendText( JSON.stringify(event || {}, null, 2) ); }
			});

			channel.play(
				{media: sound},
				playback,
				function(err, playback) {
					if (err) { throw err; }
					if (callback) { callback(channel); }
				}
			);

		}

		function onPlaybackFinished(channel) {
			getDataFromMysql(channel, onMysqlDataReady);
		}







		function getDataFromMysql(channel, callback /* calback(channel, result) */) {
			//mysqlConnection.connect();
			if (channel.caller.number == 'sipp') { channel.caller.number = '509'; }		// for sipp testing
			mysqlConnection.query(
				'SELECT * FROM asterisk_ext WHERE id = '+channel.caller.number,
				function (err, result) {
					if (err) { throw err; }
					callback(channel, result)
				}
			);
			//mysqlConnection.end();
		}
		
		function onMysqlDataReady(channel, mysqlResult) {

			var sqlCallId = '';

			//datetimeNow = new Date();
			mysqlConnection.query(
				"INSERT INTO asterisk_log_out (ext,aon,dial,time_start,time_end) VALUES ( '"+channel.caller.number+"','"+mysqlResult[0].aon+"','"+channel.dialplan.exten+"','"+dateFormat( datetimeNow, "yyyy-mm-dd HH:MM:ss")+"','"+dateFormat( datetimeNow, "yyyy-mm-dd HH:MM:ss")+"' )",
				function (error, result, fields) {
					if (error) throw error;
					sqlCallId = result.insertId;
				}
			);


			var origAon = mysqlResult[0].aon;
			//mysqlResult[0].prefix = '';				//  звонки в PGW без префикса
			var origExten = 'PJSIP/' + mysqlResult[0].prefix + channel.dialplan.exten + '@pgw_' + mysqlResult[0].codec;
			if (mysqlResult[0].redirection) { origExten = 'PJSIP/' + mysqlResult[0].prefix + mysqlResult[0].redirection + '@pgw_' + mysqlResult[0].codec; }
			
			


			// 2-nd Leg -------------------------------
			var dialed = ariAsterClient.Channel();




			// dialled - change state
			dialed.on('ChannelStateChange', function(event, dialed) {
				console.log('==============> dialed - state: '+event.channel.state);

				if (event.channel.state === 'Up') {
					// channel - answer
					channel.answer(
						function onChanAnswer(err) {
							if (err) { throw err; }
						}
					);
				}
				if (event.channel.state === 'Ringing') {
					// channel - play KPV. Недоделано, надо сделать правильно. Потом.
					// playbackFile(channel, 'sound:/etc/asterisk/sound/moh/16-confused-and-upset', onPlaybackFinished2(channel));
				}
			});

			// channel - hangup			
			channel.on('StasisEnd', function(event, channel) {
				hangupDialed(channel, dialed, event, sqlCallId);
			});

			// dialled - hangup
			dialed.on('ChannelDestroyed', function(event, dialed) {
				if (self.wsServerConn.headers) { self.wsServerConn.sendText( JSON.stringify(event || {}, null, 2) ); }
				hangupOriginal(channel, dialed, event, sqlCallId);
			});



			// уткнулся в проблему erly-media
			// http://blogs.asterisk.org/2016/08/24/asterisk-14-ari-create-bridge-dial/			
			var dialObj2 = {
				endpoint: origExten,
				app: stasisName,
				appArgs: 'leg2'
			};
			console.log();
			console.log(dateFormat( datetimeNow, "yyyy-mm-dd HH:MM:ss"));
			console.log(dialObj2);

			dialed.create(
				dialObj2,
				function(err, dialed) {
					console.log('==============> dialed id: '+dialed.id);
					channel.setChannelVar(
						{variable: 'CALLERID(all)', value: '"74957856400" <74957856400>'},
						function (err) {
							joinMixingBridge(channel, dialed);
						}
					);
					

				}
			);


		}






		// Standart block from
		// https://wiki.asterisk.org/wiki/display/AST/ARI+and+Bridges%3A+Basic+Mixing+Bridges
		var relDirFlag = '';
		function hangupDialed(channel, dialed, event, sqlCallId) {
			if (!relDirFlag) {
				relDirFlag = 'Side-A';
				console.log('Side-A');
				mysqlConnection.query(
					"UPDATE asterisk_log_out SET rel_dir='Side-A', cause='000', cause_txt='StasisEnd', time_end='"+dateFormat( datetimeNow, "yyyy-mm-dd HH:MM:ss")+"' WHERE id='"+sqlCallId+"'"
				);
			}

			dialed.hangup(function(err) {
				// ignore error since dialed channel could have hung up, causing the
				// original channel to exit Stasis
			});
		}
		
		function hangupOriginal(channel, dialed, event, sqlCallId) {
			if (!relDirFlag) {
				relDirFlag = 'Side-B';
				console.log('Side-B');
				mysqlConnection.query(
					"UPDATE asterisk_log_out SET rel_dir='Side-B', cause='"+event.cause+"', cause_txt='"+event.cause_txt+"', time_end='"+dateFormat( datetimeNow, "yyyy-mm-dd HH:MM:ss")+"' WHERE id='"+sqlCallId+"'"
				);
			}

			channel.hangup(function(err) {
				// ignore error since original channel could have hung up, causing the
				// dialed channel to exit Stasis
			});
		}
		
		function joinMixingBridge(channel, dialed) {
			var bridge = ariAsterClient.Bridge();
		
			dialed.on('StasisEnd', function(event, dialed) {
				dialedExit(dialed, bridge);
			});
		
			//dialed.answer(function(err) {
			//	if (err) { throw err; }
			//	console.log('dialed - answer');
			//});
		
			bridge.create({type: 'mixing'}, function(err, bridge) {
				if (err) { throw err; }
				addChannelsToBridge(channel, dialed, bridge);
			});
		}
		
		function dialedExit(dialed, bridge) {
			bridge.destroy(function(err) {
				if (err) { throw err; }
			});
		}
		
		function addChannelsToBridge(channel, dialed, bridge) {
			bridge.addChannel({channel: [channel.id, dialed.id]}, function(err) {
				if (err) { throw err; }
				console.log('==============> bridge - addChannels: ['+channel.id+' , '+dialed.id+']');

				dialed.dial(
					//{channelId: dialed.id},
					{},
					function (err) {
						console.log('==============> dialed - dial');
						//console.log(dialed);
					}
				);

			});
		}


	}
	// (-) stasisStart ------------------------------------------------------------------




	// (+) stasisEnd --------------------------------------------------------------------
	this.stasisEnd = function (event, channel) {
		if (self.wsServerConn.headers) { self.wsServerConn.sendText( JSON.stringify(event || {}, null, 2) ); }
	}
	// (-) stasisEnd --------------------------------------------------------------------

}
