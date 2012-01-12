;"use strict";

var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;

if ('webkitIndexedDB' in window) {
  window.IDBTransaction = window.webkitIDBTransaction;
  window.IDBKeyRange = window.webkitIDBKeyRange;
}

collect.db = function(modelCallback){

  this.modelCallback = modelCallback;

  this.__defineGetter__('lastUpdated', function() {
    return localStorage['lastUpdated'];
  });

  this.__defineSetter__('lastUpdated', function(prop) {
    localStorage['lastUpdated'] = prop;
  });

  this.open();

}

collect.db.prototype.open = function() {

  var that = this;
  var request = indexedDB.open("links");

  request.onsuccess = function(e) {
    
    var version = "1.99";
    that.db = e.target.result;
    var db = that.db;

    if (version !== db.version) {
      var setVersionRequest = db.setVersion(version);
      setVersionRequest.onerror = that.onerror;
      setVersionRequest.onsuccess = function(e) {
        if(db.objectStoreNames.contains("link")) {
          db.deleteObjectStore("link");
        }
        var store = db.createObjectStore("link", {keyPath: "couchId"});
        store.createIndex("dateCreatedDesc", "dateCreatedDesc", { unique: false }); 
        that.main();
      };
    }
    else {
        that.main();
    }

  };

  request.onerror = this.onerror;

}



collect.db.prototype.main = function(){

    collect.doc.bind('/db/links/add/done /db/links/nonew', _.bind(function(){
        this.getAllLinks(_.bind(function(links){
            this.modelCallback(links);
        }, this));
    }, this)) 

    var path = this.getPath();
    var links = $.getJSON(path);
    links.success(_.bind(function(data){
        if(data.rows.length){
            this.addLinks(data);
        }
        else {
            collect.doc.trigger('/db/links/nonew');
        }
    }, this));

}

collect.db.prototype.getPath = function(){
    var auth = 'sessimingreadvandedsoner:GkeRd7NkGogRQEqWRfJjS6Wd';
    var path = 'https://' + auth + '@geoffreymoller.cloudant.com/collect/_design/uri/_view/';
    if(this.lastUpdated){
        path += 'uri?descending=true&endkey="' + this.lastUpdated + '"&callback=?';
    }
    else{
        path += 'uri?descending=true&callback=?';
    }
    return path;
}

collect.db.prototype.onerror = function(e) {
  console.log(e);
};

collect.db.prototype.addLinks = function(data) {

    var that = this;
    var db = this.db;
    var trans = db.transaction(["link"], IDBTransaction.READ_WRITE);
    var store = trans.objectStore("link");
    trans.oncomplete = function(){
      collect.utility.timeEnd('DB::addLinks');
      that.lastUpdated = collect.server.time;
      collect.doc.trigger('/db/links/add/done');
    }

    collect.utility.time('DB::addLinks');

    _.each(data.rows, _.bind(function(link){
        this.addLink(store, link);
    }, this));

}

collect.db.prototype.delete = function(id) {
  
  var that = this;
  var db = this.db;
  var trans = db.transaction(["link"], IDBTransaction.READ_WRITE);
  var store = trans.objectStore("link");

  var request = store.delete(id);
  request.onsuccess = function(e) { 
    console.log("Successfully Deleted Link: ", id);
    collect.doc.trigger('/link/delete/success');
  }
  request.onerror = function(e) {
    console.log("Error Deleting Link: ", id);
    console.dir(e);
  };

};


collect.db.prototype.addLink = function(store, link, callback) {

  var that = this;
  var data = {
    "couchId": link.id,
    "couchRev": link.value.rev,
    "title": link.value.title,
    "uri": link.value.uri,
    "tags": link.value.tags ? link.value.tags.sort() : [] ,
    "dateCreated": link.value.date_created,
    //TODO - replace dateCreatedDesc with keyrange / descending query
    "dateCreatedDesc": 10000000000000000 - link.value.date_created,
    "dateModified": link.value.date_modified,
    "deleted": link.value.deleted
  };

  var request = store.put(data);
  request.onsuccess = function(e) { };
  request.onerror = function(e) {
    console.log("Error Adding Link: ", e);
  };

};

collect.db.prototype.getAllLinks = function(callback) {

  var that = this;
  var db = this.db;
  var links = [];
  collect.utility.time('DB::getAllLinks');

  var trans = db.transaction(["link"], IDBTransaction.READ_WRITE);
  trans.oncomplete = function(){
    callback(links);
    collect.utility.timeEnd('DB::getAllLinks');
  }
  var store = trans.objectStore("link");

  var keyRange = IDBKeyRange.lowerBound(0);
  var cursorRequest = store.index('dateCreatedDesc').openCursor(keyRange);

  cursorRequest.onsuccess = function(e) {
    var result = e.target.result;
    if(!!result == false)
      return;
    links.push(result.value);
    result.continue();
  };

  cursorRequest.onerror = this.onerror;

};

