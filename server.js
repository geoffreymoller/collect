
/**
 * Module dependencies.
 */

var
  express = require('express'),
  gzip = require('connect-gzip'),
  sys = require('util'),
  cradle = require('cradle'),
  connection = new(cradle.Connection)('https://geoffreymoller.cloudant.com', 443, {
      auth: { username: process.env.DB_API_KEY, password: process.env.DB_API_SECRET }
  });
  var db = connection.database('collect');
  uuid = require('node-uuid');

var app = module.exports = express.createServer(
    gzip.gzip({ flags: '--best' })
);
var port = 80;

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  port = 3000;
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
app.get('/', function(req, res){

    res.render('index', {
      title: 'Collect',
      serverTime: (new Date()).getTime()
    });

});

//TODO - keep this? currently going straight to DB
app.get('/links', function(req, res){

  db.view('uri/uri', callback);

  function callback(er, data){
    if(!er){
        var rows = data.json.rows;
        res.send(rows);
    }
  }

});

app.put('/update', function(req, res){

    var id = req.query.id; 
    var path =  '/_design/app/_update/in-place/' + id;
    sys.puts('path: ' + path);

    var tags = req.query.tags;
    if(tags && tags.length){
        tags = tags.split(',');
    }
    else {
        tags = []; 
    }

    var id = req.query.id;
    var callback = getCallback('Link Updated!', res);
    db.merge(id, {"tags": tags, "date_modified": new Date().getTime()}, callback);
})

app.get('/getURIByKey', function(req, res){

    var query = req.query;
    var URI = query.URI;

    var callback = getCallback('Link Retrieved!', res);
    db.view('uri/uriPlain', {key: URI}, callback)

});

app.get('/save', function(req, res){

    var query = req.query;
    var payload = {
        title: query.title, 
        URI: query.uri,
        date: new Date().getTime()
    }

    var tags = query.tags;
    if(tags){
        tags = tags.split(',');
        payload.tags = tags;
    }

    var id = uuid()
    var callback = getCallback('Document Saved!', res);
    db.save(id, payload, callback);

});

function getCallback(message, response){

    return function(er, ok){

        if (er) {
            response.send(er);
            throw new Error(JSON.stringify(er));
        }
        else{
            sys.puts(message);
            sys.puts(ok);
            response.send(ok);
        }

    }

}

app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
