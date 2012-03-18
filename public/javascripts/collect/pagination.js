;"use strict";

collect.pagination = function(page){

    this.paint = function(collectionLength, callback){

        function pageSelectCallback(index){
            callback(index);
            return false;
        }

        if(collectionLength > collect.PAGE_LENGTH){
             $(".pagination").pagination(collectionLength, {
                callback: _.bind(pageSelectCallback, this),
                current_page: this.page, 
                num_display_entries: 15,
                num_edge_entries: 1,
                items_per_page: collect.PAGE_LENGTH
            });
        }

    }

    this.page = page ? page - 1 : 0;
    this.start = this.page * collect.PAGE_LENGTH;
    if(this.page === 0){
        this.end = collect.PAGE_LENGTH - 1;
    }
    else {
        this.end = this.start + collect.PAGE_LENGTH - 1;
    }

}

collect.PAGE_LENGTH = 7;
