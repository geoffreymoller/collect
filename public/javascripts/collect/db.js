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
    if(optLastUpdated){
        links = $.getJSON(path + 'uriModified?descending=true&endkey="1323647116858"&callback=?')
    }
    else{
        links = $.getJSON(path + 'uri?descending=true&callback=?');
    }

    return links;

}
