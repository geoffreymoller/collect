"use strict";

var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;

if ('webkitIndexedDB' in window) {
  window.IDBTransaction = window.webkitIDBTransaction;
  window.IDBKeyRange = window.webkitIDBKeyRange;
}

//TODO - module to worker
collect.db = function(){

  this.__defineGetter__('updated', function() {
    return localStorage['lastUpdated'];
  });

  this.__defineSetter__('updated', function(prop) {
    localStorage['lastUpdated'] = prop;
  });

}

collect.db.prototype.getLinks = function(callback, optLastUpdated){

    var auth = 'sessimingreadvandedsoner:GkeRd7NkGogRQEqWRfJjS6Wd';
    var path = 'https://' + auth + '@geoffreymoller.cloudant.com/collect/_design/uri/_view/';
    var links;

    this.open();

    if(this.updated){
        links = $.getJSON(path + 'uriModified?descending=true&endkey="' + this.updated + '"&callback=?')
    }
    else{
        links = $.getJSON(path + 'uri?descending=true&callback=?');
    }

    links.success(_.bind(function(data){
        this.addLinks(data);
    }, this));

}

collect.db.prototype.onerror = function(e) {
  console.log(e);
};

collect.db.prototype.open = function() {

  var that = this;
  var request = indexedDB.open("links");

  request.onsuccess = function(e) {
    var version = "1.99";
    that.db = e.target.result;
    var db = that.db;

    if (version != db.version) {
      var setVersionRequest = db.setVersion(version);
      setVersionRequest.onerror = that.onerror;
      setVersionRequest.onsuccess = function(e) {
        if(db.objectStoreNames.contains("link")) {
          db.deleteObjectStore("link");
        }
        var store = db.createObjectStore("link", {keyPath: "timeStamp"});
      };
    }
  };

  request.onerror = this.onerror;

}

collect.db.prototype.addLinks = function(data) {

    var that = this;
    var db = this.db;
    var trans = db.transaction(["link"], IDBTransaction.READ_WRITE);
    var store = trans.objectStore("link");
    trans.oncomplete = function(){
      collect.utility.timeEnd('DB::addLinks');
      that.updated = collect.server.time;
      that.getAllLinks();
    }

    collect.utility.time('DB::addLinks');

    _.each(data.rows, _.bind(function(link){
        this.addLink.apply(this, [store, link]);
    }, this));

}

collect.db.prototype.addLink = function(store, link, callback) {

  var that = this;
  var data = {
    "title": link.value.title,
    "URI": link.value.uri,
    "tags": link.value.tags,
    "dateCreated": link.value.date,
    "dateModified": link.value.date,
    "timeStamp": new Date().getTime()
  };

  var request = store.put(data);
  request.onsuccess = function(e) { };
  request.onerror = function(e) {
    console.log("Error Adding Link: ", e);
  };

};

collect.db.prototype.deleteLink = function(id) {
  
  var that = this;
  var db = this.db;
  var trans = db.transaction(["link"], IDBTransaction.READ_WRITE);
  var store = trans.objectStore("link");

  var request = store.delete(id);
  request.onsuccess = function(e) { };
  request.onerror = function(e) {
    console.log("Error Adding: ", e);
  };

};

collect.db.prototype.getAllLinks = function() {

  var that = this;
  var db = this.db;
  var payload = [];
  collect.utility.time('DB::getAllLinks');
  var trans = db.transaction(["link"], IDBTransaction.READ_WRITE);
  trans.oncomplete = function(){
    collect.utility.timeEnd('DB::getAllLinks');
    console.dir(payload);
  }
  var store = trans.objectStore("link");

  var keyRange = IDBKeyRange.lowerBound(0);
  var cursorRequest = store.openCursor(keyRange);

  cursorRequest.onsuccess = function(e) {
    var result = e.target.result;
    if(!!result == false)
      return;
    payload.push(result.value);
    result.continue();
  };

  cursorRequest.onerror = this.onerror;

};

