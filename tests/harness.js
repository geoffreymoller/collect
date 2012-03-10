var argv = require('optimist').argv,
  __ = require('underscore'),
  cradle = require('cradle'),
  data = require('./data').testData,
  connection = new(cradle.Connection)('https://geoffreymoller.cloudant.com', 443, {
      auth: { username: argv.username, password: argv.password }
  });

var db = connection.database(argv.db);
//Delete all old links and update with new test data 
db.all(function(err, res){
  var deleteManifest = __.filter(res, function(value){
    return !(value.id.indexOf('_design') === 0); 
  })
  deleteManifest = __.map(deleteManifest, function(value){
    return {"_id": value.id, "_rev": value.value.rev, "_deleted": true}
  });
  db.save(deleteManifest, function(err, res){
    if(err){
      throw new Error(err);
    }
    else {
      db.save(data, function(err, res){
        if(err){
          throw new Error(err);
        }
      });
    }
  });
});

var server = require('../server.js')(argv);

