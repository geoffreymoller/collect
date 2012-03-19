;"use strict";

collect.pagination = function(page){

    this.paint = function(collectionLength, callback){

        function pageSelectCallback(index){
            callback(index);
            return false;
        }

        if(collectionLength > collect.options.PAGE_LENGTH){
             $(".pagination").pagination(collectionLength, {
                callback: _.bind(pageSelectCallback, this),
                current_page: this.page, 
                num_display_entries: 15,
                num_edge_entries: 1,
                items_per_page: collect.options.PAGE_LENGTH
            });
        }

    }

    this.page = page ? page - 1 : 0;
    this.start = this.page * collect.options.PAGE_LENGTH;
    if(this.page === 0){
        this.end = collect.options.PAGE_LENGTH - 1;
    }
    else {
        this.end = this.start + collect.options.PAGE_LENGTH - 1;
    }

}
