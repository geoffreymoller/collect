"use strict";

collect.DEBUG =  {
    performance: true
}

$(document).ready(function(){

    collect.doc = $(document); //root reference for pub-sub 

    collect.doc.bind('/model/load', function(){
        collect.app = new collect.Application();
        Backbone.history.start()
        $('body').addClass('loaded');
    });
    
    collect.model = new collect.Model();

});

