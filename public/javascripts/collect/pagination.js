collect.pagination = function(page){

    this.PAGE_LENGTH = 20;

    this.paint = function(app, collection, contextTags){
        function pageSelectCallback(index){
            var index = parseInt(index);
            index++;
            var predicate = contextTags.join(',') + '/' + index;
            app.navigate('tags/' + predicate, true);
            return false;
        }
        if(collection.length > this.PAGE_LENGTH){
             $(".pagination").pagination(collection.length, {
                callback: _.bind(pageSelectCallback, this),
                current_page: this.page, 
                num_display_entries: 20,
                num_edge_entries: 1,
                items_per_page: this.PAGE_LENGTH 
            });
        }
    }

    this.page = page ? page - 1 : 0;
    this.start = this.page * this.PAGE_LENGTH;
    if(this.page === 0){
        this.end = this.PAGE_LENGTH - 1;
    }
    else {
        this.end = this.start + this.PAGE_LENGTH - 1;
    }

}
