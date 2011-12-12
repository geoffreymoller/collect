"use strict";

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
    if(this.updated){
        links = $.getJSON(path + 'uriModified?descending=true&endkey="' + this.updated + '"&callback=?')
        //TODO - update DB 
    }
    else{
        links = $.getJSON(path + 'uri?descending=true&callback=?');
        //TODO - populate DB
    }

    links.success(function(data){
        callback(data);
    });

}
