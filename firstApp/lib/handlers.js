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


// @TODO: Authentication required
handlers._user.get = function(data, callback) {
    // Check if phone is valid
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        _data.read('users', phone, function(err, resp) {
            if (!err && resp) {
                delete resp.password;
                callback(200, resp)
            } else {
                callback(404, {
                    'Error': 'User not found'
                })
            }
        })
    } else {
        callback(400, {
            'Error': "Missing required field"
        })
    }
}

// @TODO: Authentication required
handlers._user.put = function(data, callback) {
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;


    if (phone) {
        if (firstName || lastName || password) {
            _data.read('users', phone, function(err, userData) {
                if (!err && userData) {
                    if (firstName) {
                        userData.firstName = firstName;
                    }
                    if (lastName) {
                        userData.lastName = lastName;
                    }
                    if (password) {
                        userData.password = helpers.hash(password);
                    }
                    _data.update('users', phone, userData, function(err) {
                        if (!err) {
                            callback(200)
                        } else {
                            console.log("Error in put: ", err);
                            callback(500, {
                                'Error': "Could not update data"
                            })
                        }
                    })
                } else {
                    callback(400, {
                        'Error': "The specified user does not exist"
                    })
                }
            })
        } else {
            callback(400, {
                'Error': "Missing fiellds to update"
            })
        }
    } else {
        callback(400, {
            'Error': "Missing required field"
        })
    }
}

// @TODO: Authentication required and can only delete their's and all associated records
handlers._user.delete = function(data, callback) {
    console.log("data: ", data);
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        _data.read('users', phone, function(err, resp) {
            if (!err && resp) {
                _data.delete('users', phone, function(err) {
                    if (!err) {
                        callback(200)
                    } else {
                        console.log("Error in deleting file: ", err);
                        callback(500, {
                            'Error': 'Could not delete the specified user'
                        })
                    }
                })
            } else {
                callback(400, {
                    'Error': 'Could not find the specified user'
                })
            }
        })
    } else {
        callback(400, {
            'Error': "Missing required field"
        })
    }
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

handlers.tokens = function(data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
}


handlers._tokens = {};

handlers._tokens.post = function(data, callback) {
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    if (phone && password) {
        _data.read('users', phone, function(err, userData) {
            if (!err && userData) {
                hashedPassword = helpers.hash(password)
                if (hashedPassword == userData.password) {
                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() + 1000 * 60 * 60;
                    var tokenObj = {
                        "phone": phone,
                        "id": tokenId,
                        "expires": expires
                    };
                    _data.create('tokens', tokenId, tokenObj, function(err) {
                        if (!err) {
                            callback(200, tokenObj);
                        } else {
                            callback(500, {
                                'Error': 'Could not create token'
                            })
                        }
                    })
                } else {
                    callback(400, {
                        'Error': 'Invalid password'
                    })
                }
            } else {
                callback(400, {
                    'Error': 'Could not find the specified user'
                })
            }
        })
    } else {
        callback(400, {
            'Error': "Missing required field"
        })
    }
};

handlers._tokens.get = function(data, callback) {
    var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if (id) {
        _data.read('tokens', id, function(err, resp) {
            if (!err && resp) {
                callback(200, resp)
            } else {
                callback(404, {
                    'Error': 'Token not found'
                })
            }
        })
    } else {
        callback(400, {
            'Error': "Missing required field"
        })
    }
};


handlers._tokens.put = function(data, callback) {
    var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false
    if (id && extend) {
        _data.read('tokens', id, function(err, tokenData) {
            if (!err && tokenData) {
                if (tokenData.expires > Date.now()) {
                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                    _data.update('tokens', id, tokenData, function(err) {
                        if (!err) {
                            callback(200)
                        } else {
                            callback(500, {
                                'Error': 'Could not update token expiration period'
                            })
                        }
                    })
                } else {
                    callback(400, {
                        'Error': 'Token has already expired. Please login again'
                    })
                }
            } else {
                callback(404, {
                    'Error': 'Token not found'
                })
            }
        })
    } else {
        callback(400, {
            'Error': "Missing required field"
        })
    }
};


handlers._tokens.delete = function(data, callback) {
    var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if (id) {
        _data.read('tokens', id, function(err, resp) {
            if (!err && resp) {
                _data.delete('tokens', id, function(err) {
                    if (!err) {
                        callback(200)
                    } else {
                        console.log("Error in deleting file: ", err);
                        callback(500, {
                            'Error': 'Could not delete the specified token'
                        })
                    }
                })
            } else {
                callback(400, {
                    'Error': 'Could not find the specified token'
                })
            }
        })
    } else {
        callback(400, {
            'Error': "Missing required field"
        })
    }
};

module.exports = handlers;
