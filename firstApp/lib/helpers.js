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


helpers.createRandomString = function(strLen) {

    strLen = strLen && typeof(strLen) == 'number' && strLen > 0 ? strLen : false
    if (strLen) {
        var possibleCharacters = 'abcdefghijklomnpqrstuvwxyz1234567890';
        var str = '';
        for (i = 1; i <= strLen; i++) {
            var randomChar = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            str = str + randomChar;
        }
        return str;
    } else {
        return false;
    }
}


module.exports = helpers;
