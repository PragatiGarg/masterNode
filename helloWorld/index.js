var http = require('http');
var https = require('https');
var url = require('url');
var stringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

var httpServer = http.createServer(function(req, res) {
  unifiedServer(req, res);
});

httpServer.listen(config.httpPort, function() {
  console.log("The server is listening on port ", config.httpPort);
})

var httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
}


var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
  unifiedServer(req, res);
});

httpsServer.listen(config.httpsPort, function() {
  console.log("The server is listening on port ", config.httpsPort);
})


var unifiedServer = function(req, res) {

  var parsedUrl = url.parse(req.url, true);
  var queryStringObject = parsedUrl.query;
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');
  var headers = req.headers;
  var method = req.method.toLowerCase();

  var chosenHandler = typeof(router[trimmedPath]) != 'undefined' ? router[trimmedPath] : handlers.notFound;

  var dataObject = {
    'queryStringObject': queryStringObject,
    'trimmedPath': trimmedPath,
    'headers': headers,
    'method': method
  }
  chosenHandler(dataObject, function(statusCode, payloadObject) {

    statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
    payloadObject = typeof(payloadObject) == 'object' ? payloadObject : {};
    var payloadString = JSON.stringify(payloadObject);

    res.setHeader('Content-Type', 'application/json');
    res.writeHead(statusCode);
    res.end(payloadString);
    console.log("Returning statusCode: ", statusCode, " and payload: ", payloadString);
  })
}

var handlers = {};
handlers.notFound = function(data, callback) {
  callback(404);
};

handlers.hello = function(data, callback) {
  callback(200, {
    "message": "Hello"
  });
};



var router = {
  "hello": handlers.hello
}
