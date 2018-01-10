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
var ariAsterUrl = 'http://'+ariHost+':8088';	// aster-t


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

// res - NO !!! need req !!!
var connectMyModules = function (req, res, next) {
	// Нужно для работы API Swagger по протоколу WS
	//res.wsServerConn = wsServerConn;

	// Нужно для работы API Swagger с API-Asterisk
	res.ariAsterClient = ariAsterClient;
	next();
};
// (-) ==================================== my controllers =============================================
















// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {


  // Работаю с модулем connect ======================================

  // Дополняю connect req дополнительными объектами
  //app.use(function(req, res, next) {
  //  req.myObj = {
  //    'request': {
  //      'module': request,
  //      'reqOptions': reqOptions,
  //      'auth': zxAuth
  //    },
  //    'aaa': null
  //  };
  //  next();
  //});

  // CORS - добавляю заголовки
  app.use(function (req, res, next) {
    //console.log(req);
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // После OAuth2 клиент пробъет запросом OPTION с Access-Control-Request-Headers: authorization  +  Access-Control-Request-Method:GET
    // Надо сообщить браузеру клиента что мы эту умеем такое
    res.setHeader('Access-Control-Allow-Headers', 'authorization, token, content-type')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    
    next();
  });
  
  // Не включаю умную обработку OPTIONS
  app.use(function(req, res, next) {
    if (req.method == 'OPTIONS') {
      res.end();
    }
    else {
      next();
    }
  });

  // Если у запроса есть в Header поле Authorization:Bearer значит была пройдена OAuth2
  app.use(function(req, res, next) {
    if (req.headers.authorization) {
      console.log(req.headers.authorization);
    }
    next();
  });

  // Заготовка на отдачу static файла
  app.use(function (req, res, next) {

    switch (true) {

      case (req.url === '/favion.ico'):
        res.end()
        break

      case (req.url === '/miserables.json'):
        console.log('miserables.json')
        res.end()
        break

      default:
        next();
        break

    }

  });




  // Работаю с модулем swaggerTools (объект middleware) =============
  // https://github.com/apigee-127/swagger-tools/blob/master/docs/Middleware.md

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

  // Provide the security handlers
  //app.use(middleware.swaggerSecurity({
  //  oauth2: function (req, def, scopes, callback) {
  //    // Do real stuff here
  //  }
  //}));

  // AAA на базе Header поля "token"
  app.use(function (req, res, next) {
    aaa_handle.checkAuth(req, res, next);
  });

  // Validate Swagger requests
  app.use(middleware.swaggerValidator({
    validateResponse: true
  }));

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  // https://github.com/apigee-127/swagger-tools/blob/master/middleware/swagger-ui.js
  app.use(middleware.swaggerUi({
    apiDocs: '/spec/swagger.json',
    swaggerUi: '/spec-ui'
  }));






  // Работаю с модулем http, https ==================================
  // Start the server
  http.createServer(app).listen(serverPort, function () {
    console.log('Swagger http started on port '+serverPort);
  });

  //https.createServer(httpsOptions, app).listen(httpsServerPort, function () {
  //  console.log('Swagger https started on port '+httpsServerPort);
  //});
});






