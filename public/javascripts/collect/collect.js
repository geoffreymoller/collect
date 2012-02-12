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

    window.visualSearch = VS.init({
      container : $('#search'),
      query     : '',
      callbacks : {
        search       : function(query, searchCollection) {

        },
        facetMatches : function(callback) {
          callback([ 'tag' ]);
        },
        valueMatches : function(facet, searchTerm, callback) {
          switch (facet) {
            case 'tag':
              callback(['public', 'private', 'protected']);
            break;
        }
      }
      }
    });

  }

  collect.model = new collect.Model(appCallback);

}

collect.loader = function(){
  $('#wrapper').html($('<strong>Loading Collect...</strong><div id="loader"></div>'));
}

