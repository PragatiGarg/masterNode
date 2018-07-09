var crypto = require('crypto')
var config = require('./config')

var helpers = {};


helpers.hash = function(input) {
  if (typeof(input) == 'string' && input.length > 0) {
    var hash = crypto.createHmac('sha256', config.hashingSecret).update(input).digest('hex');
    return hash;
  } else {
    return false;
  }
}


helpers.parseJSONtoObject = function(inputString) {
  try {
    var obj = JSON.parse(inputString);
    return obj;
  } catch (e) {
    return {};
  }
}
module.exports = helpers;
