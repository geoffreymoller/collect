collect.Search = function(){

    collect.search = VS.init({
      container: $('#search'),
      query: '',
      callbacks: {
        search: function(query, searchCollection) {
          var params = {};
          searchCollection.each(function(model){
            var category = model.get('category');
            var value = model.get('value');
            if(params[category]){
              params[category] = params[category] + '+' + value;
            }
            else {
              params[category] = value;
            }
          });
          if(!!!params.tag){
            params['tag'] = 'all';
          }
          collect.app.navigate('tags/' + params['tag'], true);
        },
        facetMatches: function(callback) {
          callback([ 'tag' ]);
        },
        valueMatches: function(facet, searchTerm, callback) {
          switch (facet) {
            case 'tag':
              callback(collect.model.sortedTags.alpha);
            break;
          }
        }
      }
    });

}
