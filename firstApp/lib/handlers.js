var _data = require('./data');
var helpers = require('./helpers');
var handlers = {};

handlers._user = {}

handlers._user.post = function(data, callback) {


  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    _data.read('users', phone, function(err, data) {
      if (err) {
        var hashedPassword = helpers.hash(password);
        if (hashedPassword) {
          var dataToWrite = {
            'firstName': firstName,
            'lastName': lastName,
            'phone': phone,
            'password': hashedPassword,
            'tosAgreement': true
          }
          _data.create('users', phone, dataToWrite, function(err) {
            if (!err) {
              callback(200)
            } else {
              callback(500, {
                'Error': 'Could not create new user'
              })
            }
          })

        } else {
          callback(500, {
            'Error': 'Could not hash password'
          })
        }
      } else {
        //  User already exosts
        callback(400, {
          'Error': 'User already exists'
        });
      }
    })
  } else {
    callback(400, {
      'Error': 'Missing arguments',
      'input': {
        'firstName': firstName,
        'lastName': lastName,
        'phone': phone,
        'password': password,
        'tosAgreement': tosAgreement
      }
    });
  }
}

handlers._user.get = function(data, callback) {

}

handlers._user.put = function(data, callback) {

}

handlers._user.delete = function(data, callback) {

}

handlers.notFound = function(data, callback) {
  callback(404);
};

handlers.ping = function(data, callback) {
  callback(200)
};

handlers.users = function(data, callback) {
  var acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._user[data.method](data, callback);
  } else {
    callback(405);
  }
}
module.exports = handlers;
