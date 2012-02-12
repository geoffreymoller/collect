;"use strict";

collect.Model = function(appCallback){

    var dbCallback = _.bind(function(data){
        collect.utility.time('Model::dbCallback');
        this.data = data;
        this.titleIndex = new collect.Index();
        this.tagInvertedIndex = new collect.TagIndex(); 
        this.Context = Backbone.Model.extend();
        this.context = new this.Context();
        this.LinkCollection = Backbone.Collection.extend();
        this.linkCollection = new this.LinkCollection();
        this.linkCollection.bind('remove', goog.bind(this.removeLinkHandler, this));
        this.Link = Backbone.Model.extend();
        this.Tag = Backbone.Model.extend();
        this.data.forEach(goog.bind(this.createLink, this));
        this.sortTags();
        appCallback();
        collect.utility.timeEnd('Model::dbCallback');
    }, this);

    this.db = new collect.db(dbCallback);

}

collect.Model.prototype.removeLinkHandler = function(model, collection){
    var id = model.get('couchId');
    var rev = model.get('couchRev');
    var deletion = $.get('/delete', {id: id, rev: rev});
    deletion.success(goog.bind(function(data){
        this.db.delete(id);
    }, this));
    deletion.error(function(data){
        throw new Error('Error deleting link at remote DB');
    });
}

collect.Model.prototype.delete = function(id, rev){
    var contextModel = this.linkCollection.find(function(link){
        return link.get('couchId') === id;
    });
    this.linkCollection.remove(contextModel);
}

collect.Model.prototype.createLink = function(link, datumIndex, array){
    var _link = new this.Link(link);
    this.linkCollection.add(_link);
    this.indexLink(link, datumIndex);
}

collect.Model.prototype.indexLink = function(link, datumIndex){
    if(link.title){
        this.titleIndex.add(link.title.toLowerCase().split(' '), datumIndex);
    }
    if(link.tags){
        this.tagInvertedIndex.add(link.tags, datumIndex);
    }
}

collect.Model.prototype.getMultipleAdjacency = function(){
    var args = arguments;
}

collect.Model.prototype.sortTags = function(){

    this.sortedTags = {
      count: [],
      alpha: []
    };
    for(var tag in this.tagInvertedIndex.data){
        this.tagInvertedIndex.data[tag].adjacent = this.tagInvertedIndex.data[tag].adjacent.sort();
        this.sortedTags.count.push({name: tag, value: this.tagInvertedIndex.data[tag].count});
        this.sortedTags.alpha.push(tag);
    }  

    this.sortedTags.alpha = this.sortedTags.alpha.sort();
    this.sortedTags.count = this.sortedTags.count.sort(function(a, b) {
        if(a.value < b.value){
            return -1;
        }
        else if(a.value > b.value){
            return 1;
        }
        else {
            if(a.name > b.name){
                return -1;
            }
            else if(a.name < b.name){
                return 1;
            }
            else {
                return 0;
            }
        }
    }).reverse();
}

collect.Model.prototype.relatedTags  = function(contextTags){
    var payload = {
        list: [],
        map: {}
    };
    contextTags.forEach(_.bind(function(context){
        if(context && this.tagInvertedIndex.data[context]){
            payload.list.push({name: context, type: 'active', count: this.tagInvertedIndex.data[context].count});
            payload.map[context] = { type: 'active' };
        }
    }, this));

    if(contextTags.length > 1){
        var intersection;
        contextTags.forEach(_.bind(function(tag){
            var contextTag = this.tagInvertedIndex.data[tag];
            if(contextTag){
                if(!intersection){
                    intersection = contextTag.adjacent;
                }
                else {
                    intersection = _.intersection(intersection, contextTag.adjacent);
                }
            }
        }, this));
        if(intersection){
            intersection.forEach(_.bind(function(adjacentNode){
                payload.list.push({name: adjacentNode, type: 'adjacent', count: this.tagInvertedIndex.data[adjacentNode].count});
                payload.map[adjacentNode] = { type: 'adjacent' };
            }, this));
        }
    }
    else {
        contextTags.forEach(_.bind(function(tag){
            var contextTag = this.tagInvertedIndex.data[tag];
            if(contextTag){
                var adjacent = contextTag.adjacent;
                adjacent.forEach(_.bind(function(adjacentNode){
                    payload.list.push({name: adjacentNode, type: 'adjacent', count: this.tagInvertedIndex.data[adjacentNode].count});
                    payload.map[adjacentNode] = { type: 'adjacent' };
                }, this));
            }
        }, this));
    }

    return payload;
}

collect.Model.prototype.contextLinks  = function(contextTags){
    if(contextTags.length === 1 && contextTags[0] === 'all'){
        return this.linkCollection.toJSON();
    }
    else{ 
        var tagIndexes = [];
        contextTags.forEach(_.bind(function(tag, index, items){
            var tag = this.tagInvertedIndex.data[tag];
            if(tag){
                var subList = tag.indexes;
                tagIndexes.push(subList);
            }
        }, this));

        var indexes;
        if(contextTags.length > 1){
            indexes = _.intersection.apply({}, tagIndexes);
        }
        else {
            indexes = tagIndexes[0];
        }

        if(indexes){
            var temp = [];
            indexes.forEach(_.bind(function(contextIndex, index, items){
                var link = this.linkCollection.at(contextIndex);
                temp.push(link.toJSON());
            }, this));
            return temp;
        }
        else{
            return [];
        }

    }
}

collect.Model.formatDate = function(date){
    if(date){
        date = new Date(date);
        date = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
    }
    else {
        date = '--';
    }
    return date;
}
