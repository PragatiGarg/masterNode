var fs = require('fs');
var path = require('path');


var lib = {};
lib.baseDir = path.join(__dirname, '/../.data/');

lib.create = function(dir, fileName, data, callback) {

  fs.open(lib.baseDir + dir + '/' + fileName + '.json', 'wx', function(err, fileDescriptor) {
    if (!err && fileDescriptor) {
      var stringData = JSON.stringify(data);
      fs.writeFile(fileDescriptor, stringData, function(err) {
        if (!err) {
          fs.close(fileDescriptor, function(err) {
            if (!err) {
              callback(false);
            } else {
              callback('Error closing the file');
            }
          })
        } else {
          callback('Error writing to file');
        }
      });
    } else {
      callback('Could not create file. File name might already exist')
    }
  })
}

lib.read = function(dir, fileName, callback) {
  fs.readFile(lib.baseDir + dir + '/' + fileName + '.json', 'utf-8', function(err, data) {
    callback(err, data);
  })
}

lib.update = function(dir, fileName, data, callback) {
  fs.open(lib.baseDir + dir + '/' + fileName + '.json', 'r+', function(err, fileDescriptor) {
    if (!err && fileDescriptor) {
      var stringData = JSON.stringify(data);
      fs.truncate(fileDescriptor, function(err) {
        if (!err) {
          fs.writeFile(fileDescriptor, stringData, function(err) {
            if (!err) {
              fs.close(fileDescriptor, function(err) {
                if (!err) {
                  callback(false);
                } else {
                  callback('Error closing the file');
                }
              })
            } else {
              callback('Error writing to file');
            }
          });
        } else {
          callback('Could not truncate file');
        }
      })
    } else {
      callback('Could not open file for update. It may not exist');
    }
  })
}

lib.delete = function(dir, fileName, callback) {
  fs.unlink(lib.baseDir + dir + '/' + fileName + '.json', function(err) {
    if (!err) {
      callback(false);
    } else {
      callback('Error unlinking file ' + err)
    }
  });
}


module.exports = lib;
