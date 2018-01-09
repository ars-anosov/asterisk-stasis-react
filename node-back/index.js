'use strict';

// Arguments ---------------------------------------------
var nodePath  = process.argv[0]
var appPath   = process.argv[1]
var ariHost   = process.argv[2]
var ariUser   = process.argv[3]
var ariPass   = typeof process.argv[4] === 'undefined' ? '' : process.argv[4]
var dbHost   = process.argv[5]
var dbUser   = process.argv[6]
var dbPass   = process.argv[7]

console.log('Asterisk ARI Host:     '+ariHost)
console.log('Asterisk ARI User:     '+ariUser)
console.log('Asterisk ARI Password: '+ariPass)
console.log()
console.log('DB Host:     '+dbHost)
console.log('DB User:     '+dbUser)
console.log('DB Password: '+dbPass)
console.log()
var aaa_handle = require('./sub_modules/aaa_handle')





var app = require('connect')();
var http = require('http');
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var fs = require('fs');
var serverPort = 8004;

// swaggerRouter configuration
var options = {
  swaggerUi: '/swagger.json',
  controllers: './controllers',
  useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync('./api/asterisk-api.yaml', 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);











// (+) ==================================== my controllers =============================================

// Это потом подсуну в Express объект res
//var wsServerConn = {};
var ariAsterClient = {};

// Это stasis-приложения, которые потом стартую на Asterisk
var asterFromInternal = require('./aster_from_internal');
var stasisFromInternal = {};
var asterFromExternal = require('./aster_from_external');
var stasisFromExternal = {};
var mysql = require('mysql');
var mysqlConnection = mysql.createConnection({
	host     : dbHost,
	user     : dbUser,
	password : dbPass,
	database : 'asterisk'
});



// ARI connect -----------------------------------------------------------------------------
//var ariAsterUrl = 'http://localhost:8088';				// localhost
var ariAsterUrl = 'http://'+ariHost+':8088';	// aster-t
//var ariAsterUrl = 'http://trend.intellin-tech.ru:8088';		// trend


var ari = require('ari-client');
ari.connect(ariAsterUrl, ariUser, ariPass, clientLoaded);

function clientLoaded(err, client) {
	if (err) {
		throw err;
	}

	console.log('\n----------- ARI loaded:');
	console.log('url: '+client._swagger.url);
	console.log('basePath: '+client._swagger.basePath);
	console.log('swaggerVersion: '+client._swagger.swaggerVersion);
	console.log('apiVersion: '+client._swagger.apiVersion);
	
	// Наполняю глобальную переменную
	ariAsterClient = client;
	
	// ---------------------- Stasis Dialplan ---------------------------------
	// Стартую новые stasis приложения на астериске
	stasisFromInternal = new asterFromInternal.Stasis(client, 'from-internal', mysqlConnection);
	stasisFromExternal = new asterFromExternal.Stasis(client, 'from-external', mysqlConnection);

	// Подписываюсь на события
	ariAsterClient.on('StasisStart', function stasisStart(event, channel) {
		if (event.application == 'from-internal') {
			stasisFromInternal.stasisStart(event, channel);
		}
		if (event.application == 'from-external') {
			stasisFromExternal.stasisStart(event, channel);
		}
	});

	ariAsterClient.on('StasisEnd', function stasisEnd(event, channel) {
		if (event.application == 'from-internal') {
			stasisFromInternal.stasisEnd(event, channel);
		}
		if (event.application == 'from-external') {
			stasisFromExternal.stasisEnd(event, channel);
		}
	});

	// Стартую приложяния на Астериске
	stasisFromInternal.appStart();
	stasisFromExternal.appStart();
}




// WS Server -----------------------------------------------------------------------------
// var serverPortWS = 8001;
// 
// var ws = require("nodejs-websocket");
// ws.createServer(function wsConnected(conn) {
// 	console.log('\n----------- WS new client:');
// 	console.log(conn.headers)
// 	
// 	// Наполняю глобальную переменную
// 	wsServerConn = conn;
// 
// 	// Засовываю wsServerConn в объекы stasis
// 	stasisFromInternal.wsServerConn = conn;
// 	stasisFromExternal.wsServerConn = conn;
// 
// }).listen(serverPortWS);
// 
// console.log('WS server                 ws://node-t.intellin-tech.ru:%d\n', serverPortWS);




// Express my addon: Прокидываю свои контроллеры в переменной res
var connectMyModules = function (req, res, next) {
	// Нужно для работы API Swagger по протоколу WS
	//res.wsServerConn = wsServerConn;

	// Нужно для работы API Swagger с API-Asterisk
	res.ariAsterClient = ariAsterClient;
	next();
};
// (-) ==================================== my controllers =============================================














// Initialize the Swagger middleware ----------------------------------------------------------------------
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {

	// CORS - добавляю заголовки
	app.use(function (req, res, next) {
	
		res.setHeader('Access-Control-Allow-Origin', '*');
		//res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
		res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
		//res.setHeader('Content-Type', 'application/json');
		next();
	});
	
	// Пропускаю обработку OPTIONS
	app.use(function(req, res, next) {
		if (req.method == 'OPTIONS') {
			res.end('');
		}
		else {
			next();
		}
	});

	// Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
	app.use(middleware.swaggerMetadata());

	// Validate Swagger requests
	app.use(middleware.swaggerValidator());

	// Прокидываю свои контроллеры в переменной res
	app.use(connectMyModules);

	// Route validated requests to appropriate controller
	app.use(middleware.swaggerRouter(options));

	// Serve the Swagger documents and Swagger UI
	app.use(middleware.swaggerUi());



	// Start the server
	http.createServer(app).listen(serverPort, function () {
		console.log('REST API Serevr           http://node-t.intellin-tech.ru:%d\n', serverPort);
		console.log('Swagger-ui                http://node-t.intellin-tech.ru:%d/docs\n', serverPort);
	});
});






