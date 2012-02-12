collect.Search = function(){

    window.visualSearch = VS.init({
      container: $('#search'),
      query: '',
      callbacks: {
        search: function(query, searchCollection) {
          console.dir(query);
        },
        facetMatches: function(callback) {
          callback([ 'tag' ]);
        },
        valueMatches: function(facet, searchTerm, callback) {
          switch (facet) {
            case 'tag':
              callback(['public', 'private', 'protected']);
            break;
          }
        }
      }
    });

}
