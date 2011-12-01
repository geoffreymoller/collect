collect.utility = {

    time: function(id){
        if(DEBUG.performance){
            console.time(id);
        }
    },

    timeEnd: function(id){
        if(DEBUG.performance){
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
    }

}
