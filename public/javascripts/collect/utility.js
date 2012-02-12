;"use strict";

collect.utility = {

    time: function(id){
        if(collect.DEBUG.performance){
            console.time(id);
        }
    },

    timeEnd: function(id){
        if(collect.DEBUG.performance){
            console.timeEnd(id);
        }
    },

    truncate: function(str){
        var threshold = 140;
        if(str.length >= threshold){
            return str.substr(0, threshold) + '...';
        }
        else {
            return str; 
        }
    },

    parseQuery: function(query){
      var params = {};
      _.each(query.split(';'), function(item){
        var parts = item.split('=');
        var category = parts[0];
        var value = parts[1];
        params[category] = value;
      });
      return params;
    }

}
