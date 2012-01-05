collect.ApplicationCache = function(){
  
  var cache = window.applicationCache;

  //First cache save
  cache.addEventListener('cached', function(e) {
    collect.doc.trigger('/collect/appcache/ready');
  }, false);

  cache.addEventListener('updateready', function(e) {
      cache.swapCache();
      setTimeout(function(){
        window.location.reload();
      }, 300);
  }, false);

  cache.addEventListener('noupdate', function(e) {
    collect.doc.trigger('/collect/appcache/ready');
  }, false);

  cache.addEventListener('obsolete', function(e) {
      window.location.reload();
  }, false);

}
