;"use strict";

collect.DEBUG =  {
    performance: true
}

$(document).ready(function(e) {
  collect.loader();
  collect.doc = $(document); //root reference for pub-sub 
  collect.main();
});

collect.main = function(){

  var appCallback = function(){
    collect.app = new collect.Application();
    Backbone.history.start()
    $('body').addClass('loaded');
  }

  collect.model = new collect.Model(appCallback);

}

collect.loader = function(){
  $('#wrapper').html($('<strong>Loading Collect...</strong><div id="loader"></div>'));
}

