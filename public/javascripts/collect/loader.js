;"use strict";

collect.Loader = function(){
  var label = $('#loader span');
  collect.doc.bind('/loader/status', function(e, text){
    label.html(text);  
  });
}

