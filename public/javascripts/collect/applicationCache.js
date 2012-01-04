collect.applicationCache = new function(){

  window.addEventListener('load', function(e) {

    var cache = window.applicationCache;
    cache.addEventListener('updateready', function(e) {
      if (cache.status === cache.UPDATEREADY) {
        cache.swapCache();
        if (confirm('A new version of this site is available. Load it?')) {
          window.location.reload();
        }
      } 
    }, false);

  }, false);


}
