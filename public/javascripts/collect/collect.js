;"use strict";

collect.DEBUG =  {
    performance: true
}

$(document).ready(function(e) {
  collect.doc = $(document); //root reference for pub-sub 
  var loader = new collect.Loader();
  collect.main();
});

collect.main = function(){

  var appCallback = function(){
    collect.doc.trigger('/loader/status', 'Building Application...');
    collect.app = new collect.Application();
    Backbone.history.start()
  }

  collect.doc.trigger('/loader/status', 'Building Model...');
  collect.model = new collect.Model(appCallback);

}

