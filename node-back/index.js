'use strict'

// Modules ------------------------------------------------
var app           = require('connect')()
var http          = require('http')
var swaggerTools  = require('swagger-tools')
var jsyaml        = require('js-yaml')
var fs            = require('fs')

var aaa_handle    = require('./sub_modules/aaa_handle')
var mysqlTools    = require('./sub_modules/mysql_tools')
var apiTools      = require('./sub_modules/api_tools')
var ariTools      = require('./sub_modules/ari_tools')
var wsTools       = require('./sub_modules/ws_tools')

var asterFromInternal = require('./aster_from_internal')
var asterFromExternal = require('./aster_from_external')



// Arguments ---------------------------------------------
var nodePath      = process.argv[0]
var appPath       = process.argv[1]
var ariHost       = process.argv[2]
var ariUser       = process.argv[3]
var ariPass       = typeof process.argv[4] === 'undefined' ? '' : process.argv[4]
var dbHost        = process.argv[5]
var dbUser        = process.argv[6]
var dbPass        = process.argv[7]

console.log('args:')
console.log('  Asterisk ARI Host:     '+ariHost)
console.log('  Asterisk ARI User:     '+ariUser)
console.log('  Asterisk ARI Password: '+ariPass)
console.log('  DB Host:               '+dbHost)
console.log('  DB User:               '+dbUser)
console.log('  DB Password:           '+dbPass)
console.log()



// Variables ----------------------------------------------
var serverPort    = 8004
var serverPortWS  = 8006

var options       = {
  swaggerUi: '/swagger.json',
  controllers: './controllers',
  useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
}
var spec          = fs.readFileSync('./api/asterisk-api.yaml', 'utf8')
var swaggerDoc    = jsyaml.safeLoad(spec)

var mysqlConfigAsterisk = {
  connectionLimit : 3,
  host     : dbHost,
  user     : dbUser,
  password : dbPass,
  database : 'asterisk'
}



// Глобальные переменные, будут асинхронно мутировать. ----
var wsServer              = {}
var ariAsterClient        = {}
var mysqlPoolAsterisk     = {}
var PlatformChannelsNow   = {'channels': {}, 'bridges': {}}






// |--------------|
// |     MySQL    |
// |--------------|
var mysql = require('mysql')

// Мутирую глобальную переменную
mysqlPoolAsterisk = mysql.createPool(mysqlConfigAsterisk)

mysqlTools.mysqlAction(
  mysqlPoolAsterisk,
  "SHOW GLOBAL VARIABLES LIKE 'version%'",
  function(result) {
    console.log('|--------------|')
    console.log('|\x1b[36m DB connected \x1b[0m|')
    console.log('|--------------|')
    result.map((row) => {
      console.log('  '+row.Variable_name+': '+row.Value)
    })
  }
)



// |------------------------|
// |      Asterisk ARI      |
// |------------------------|
// https://github.com/asterisk/node-ari-client
var ari = require('ari-client')

ari.connect('http://'+ariHost+':8088', ariUser, ariPass, clientLoaded)

function clientLoaded(err, client) {
  if (err) {
    throw err
  }

  // Мутирую глобальную переменную
  ariAsterClient = client
  console.log('|------------------------|')
  console.log('|\x1b[36m Asterisk ARI connected \x1b[0m|')
  console.log('|------------------------|')
  console.log('  url:            '+client._swagger.url)
  console.log('  basePath:       '+client._swagger.basePath)
  console.log('  swaggerVersion: '+client._swagger.swaggerVersion)
  console.log('  apiVersion:     '+client._swagger.apiVersion)



  // Мутирую глобальную переменную PlatformChannelsNow
  setInterval(
  () => {
    ariTools.PlatformChannels(ariAsterClient, (chanList, brList) => {
      PlatformChannelsNow = {'channels': chanList, 'bridges': brList}
    })
  }, 1000)

  var stasisFromInternal = new asterFromInternal.Stasis(client, 'from-internal', mysqlPoolAsterisk, wsServer)
  //var stasisFromExternal = new asterFromExternal.Stasis(client, 'from-external', mysqlPoolAsterisk, wsServer)

  // Подписываюсь на события
  ariAsterClient.on('StasisStart', function stasisStart(event, channel) {
    if (event.application == 'from-internal') {
      stasisFromInternal.stasisStart(event, channel)
    }
    if (event.application == 'from-external') {
      //stasisFromExternal.stasisStart(event, channel)
    }
  })

  ariAsterClient.on('StasisEnd', function stasisEnd(event, channel) {
    if (event.application == 'from-internal') {
      stasisFromInternal.stasisEnd(event, channel)
    }
    if (event.application == 'from-external') {
      //stasisFromExternal.stasisEnd(event, channel)
    }
  })

  // Стартую приложяния на Астериске
  stasisFromInternal.appStart()
  //stasisFromExternal.appStart()
}



// |--------------------------|
// |     Websocket server     |
// |--------------------------|
// https://github.com/sitegui/nodejs-websocket/blob/master/samples/chat/server.js
var ws = require("nodejs-websocket")

// Мутирую глобальную переменную при каждом новом коннекте
wsServer = ws.createServer(function (connection) {
  
  wsTools.wsNewConn(wsServer, connection)
  
  connection.on("close", function () {
    wsTools.wsCloseConn(wsServer, connection)
    //wsBroadcast(connection.nickname+" left")
  })

})

wsServer.listen(serverPortWS)
console.log('|--------------------------|')
console.log('|\x1b[36m Websocket server started \x1b[0m|')
console.log('|--------------------------|')
console.log('  ws://192.168.13.97:%d', serverPortWS)
console.log('  connections now: ', wsServer.connections.length)
console.log()








// ================================================================================================
// =                               connect (express) chain                                        =
// ================================================================================================

// Обрабатываю HTTP Headers

// CORS - добавляю заголовки
var httpAccessControl = function (req, res, next) {
  //console.log(req)
  res.setHeader('Access-Control-Allow-Origin', '*')
  // После OAuth2 клиент пробъет запросом OPTION с Access-Control-Request-Headers: authorization  +  Access-Control-Request-Method:GET
  // Надо сообщить браузеру клиента что мы эту умеем такое
  res.setHeader('Access-Control-Allow-Headers', 'authorization, token, content-type')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  next()
}

// Не включаю умную обработку OPTIONS
var httpOptions = function(req, res, next) {
  if (req.method == 'OPTIONS') {
    res.end()
  }
  else {
    next()
  }
}

// Если у запроса есть в Header поле Authorization:Bearer значит была пройдена OAuth2
var httpOaut2 = function(req, res, next) {
  if (req.headers.authorization) {
    console.log(req.headers.authorization)
  }
  next()
}

// Заготовка на отдачу static файла
var httpStaticFiles = function (req, res, next) {
  switch (true) {
    case (req.url === '/favion.ico'):
      res.end()
      break
    default:
      next()
      break
  }
}

// Наполнение req.myObj объекта мутирующими глобальными объектами
var connectMyModules = function(req, res, next) {
  req.myObj = {
    'ariAsterClient':       ariAsterClient,
    'wsServer':             wsServer,
    'PlatformChannelsNow':  PlatformChannelsNow,
    'mysqlPoolAsterisk':    mysqlPoolAsterisk,
    'aaa':                  null
  }
  next()
}






// ================================================================================================
// =                                  [middleware] obj                                            =
// ================================================================================================

swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
  // Работаю с модулем swaggerTools (объект middleware) =============
  // https://github.com/apigee-127/swagger-tools/blob/master/docs/Middleware.md

  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata())

  // Правильная реакция на всякое от HTTP
  app.use(httpAccessControl)
  app.use(httpOptions)
  app.use(httpOaut2)
  app.use(httpStaticFiles)
  
  // Прокидываю свои контроллеры в переменной req
  app.use(connectMyModules)

  // AAA на базе HTTP Header "token"
  app.use(aaa_handle.checkAuth)

  // AAA на базе oauth2
  //app.use(middleware.swaggerSecurity({
  //  oauth2: function (req, def, scopes, callback) {
  //    // Do real stuff here
  //  }
  //}))

  // Validate Swagger requests
  app.use(middleware.swaggerValidator({
    validateResponse: true
  }))

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options))

  // Serve the Swagger documents and Swagger UI
  // https://github.com/apigee-127/swagger-tools/blob/master/middleware/swagger-ui.js
  app.use(middleware.swaggerUi({
    apiDocs: '/spec/swagger.json',
    swaggerUi: '/spec-ui'
  }))






  // Работаю с модулем http, https ==================================
  // http + app (connect-chain + middleware) START !!!
  http.createServer(app).listen(serverPort, function () {
    console.log('|---------------------------------|')
    console.log('|\x1b[36m Asterisk stasis REACTOR started \x1b[0m|')
    console.log('|---------------------------------|')
    console.log('  Swagger-UI: http://192.168.13.97:'+serverPort+'/spec-ui/')
    console.log()
    console.log()
  })

  //https.createServer(httpsOptions, app).listen(httpsServerPort, function () {
  //  console.log('Swagger https started on port '+httpsServerPort)
  //})
})
