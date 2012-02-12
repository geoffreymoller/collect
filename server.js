
/**
 * Module dependencies.
 */

var
  express = require('express'),
  path = require('path'),
  fs = require('fs'),
  gzip = require('connect-gzip'),
  sys = require('util'),
  cradle = require('cradle'),
  assetManager = require('connect-assetmanager'),
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
var cssFiles = [
    'bootstrap.min.css'
    , 'pagination.css'
    , 'style.css'
    , 'visualsearch-datauri.css'
]

var javascriptFiles = [
    'collect-closure-compiled.js'
    , 'html4-defs.js'
    , 'html-sanitizer.js'
    , 'jquery-1.7.min.js'
    , 'jquery.ui.core.js'
    , 'jquery.ui.position.js'
    , 'jquery.ui.widget.js'
    , 'jquery.ui.autocomplete.js'
    , 'jquery.pagination.js'
    , 'underscore-min.js'
    , 'handlebars-1.0.0.beta.4.js'
    , 'backbone-min.js'
    , 'backbone.layoutmanager.js'
    , 'visualsearch.js'
    , 'd3/d3.js'
    , 'd3/d3.layout.js'
    , 'collect/collect.js'
    , 'collect/applicationCache.js'
    , 'collect/pagination.js'
    , 'collect/chart/bubble.js'
    , 'collect/utility.js'
    , 'collect/application.js'
    , 'collect/search.js'
    , 'collect/model.js'
    , 'collect/index.js'
    , 'collect/db.js'
]

var assetManagerGroups = {
    'js': {
        'route': /\/javascripts\/collect_all.js/
        , 'path': './public/javascripts/'
        , 'dataType': 'javascript'
        , 'files': javascriptFiles
    },
    'css': {
        'route': /\/stylesheets\/collect_all.css/
        , 'path': './public/stylesheets/'
        , 'dataType': 'css'
        , 'files': cssFiles
    }
};
var assetsManagerMiddleware = assetManager(assetManagerGroups);

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
  app.use(assetsManagerMiddleware);
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

var env;
var manifest;
app.configure('development', function(){
  env = 'dev';
  port = 3000;
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  env = 'prod';
  app.use(express.errorHandler()); 
});

// Routes
app.get('/', function(req, res){

    var agent = req.headers['user-agent'];
    var isMobile =!!(agent.match(/(iPhone|iPod|blackberry|android 0.5|htc|lg|midp|mmp|mobile|nokia|opera mini|palm|pocket|psp|sgh|smartphone|symbian|treo mini|Playstation Portable|SonyEricsson|Samsung|MobileExplorer|PalmSource|Benq|Windows Phone|Windows Mobile|IEMobile|Windows CE|Nintendo Wii)/i));
    if(isMobile){
        res.redirect('http://geoffreymoller.no.de/');
    }
    else {
        res.render('index', {
          title: 'Collect',
          serverTime: (new Date()).getTime(),
          env: env,
          manifest: manifest,
          static: {
              javascriptFiles: javascriptFiles,
              javascriptHash: assetsManagerMiddleware.cacheHashes['js'],
              cssFiles: cssFiles,
              cssHash: assetsManagerMiddleware.cacheHashes['css']
          }
        });
    }

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

app.post('/save', function(req, res){

    var body = req.body;
    var payload = {
        title: body.title, 
        URI: body.uri,
        notes: body.notes,
        date: new Date().getTime()
    }

    var tags = body.tags;
    if(tags){
        tags = tags.split(',');
        payload.tags = tags;
    }

    var id = uuid()
    var callback = getCallback('Document Saved!', res);
    db.save(id, payload, callback);

});

app.post('/update', function(req, res){

    var id = req.body.id; 

    var tags = req.body.tags;
    if(tags && tags.length){
        tags = tags.split(',');
    }
    else {
        tags = []; 
    }

    var payload = {
      "tags": tags,
      "date_modified": new Date().getTime(),
      "notes": req.body.notes,
      "deleted": false
    }

    var id = req.body.id;
    var callback = getCallback('Link Updated!', res);
    db.merge(id, payload, callback);
})

app.get('/getURIByKey', function(req, res){

    var query = req.query;
    var URI = query.URI;

    var callback = getCallback('Link Retrieved!', res);
    db.view('uri/uriPlain', {key: URI}, callback)

});

app.get('/delete', function(req, res){

    var query = req.query;
    var id = query.id;
    var callback = getCallback('Link Deleted!', res);
    db.merge(id, {"deleted": true, "date_modified": new Date().getTime()}, callback);

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
