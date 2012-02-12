;"use strict";

collect.DEBUG =  {
    performance: true
}

$(document).ready(function(e) {
  collect.doc = $(document); //root reference for pub-sub 
  collect.main();
});

collect.main = function(){

  var appCallback = function(){
    collect.app = new collect.Application();
    Backbone.history.start()
  }

  collect.model = new collect.Model(appCallback);

}

