;"use strict";

collect.Model = function(appCallback){

    var dbCallback = _.bind(function(data){
        this.data = data;
        this.tagInvertedIndex = {};
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

    if(link.tags){
        this.createTagIndex(link.tags, datumIndex, this.tagInvertedIndex);
    }

}

collect.Model.prototype.createTagIndex = function(tags, datumIndex, tagInvertedIndex){

    var delegate = function(tag, index){
        
        var context = [tag];
        var adjacentTags = _.difference(tags, context);

        if(!tagInvertedIndex[tag]){
            tagInvertedIndex[tag] = {count: 1, indexes: [datumIndex], adjacent: adjacentTags}
        }
        else {
            var tag = tagInvertedIndex[tag];
            tag.count++;
            tag.indexes.push(datumIndex);
            tag.adjacent = _.unique(tag.adjacent.concat(adjacentTags));
        }
    }

    tags.forEach(delegate);

}

collect.Model.prototype.getMultipleAdjacency = function(){
    var args = arguments;
}

collect.Model.prototype.sortTags = function(){

    this.sortedTags = []
    for(var tag in this.tagInvertedIndex){
        this.tagInvertedIndex[tag].adjacent = this.tagInvertedIndex[tag].adjacent.sort();
        this.sortedTags.push({name: tag, value: this.tagInvertedIndex[tag].count});
    }  

    this.sortedTags = this.sortedTags.sort(function(a, b) {
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
        if(context && this.tagInvertedIndex[context]){
            payload.list.push({name: context, type: 'active', count: this.tagInvertedIndex[context].count});
            payload.map[context] = { type: 'active' };
        }
    }, this));

    if(contextTags.length > 1){
        var intersection;
        contextTags.forEach(_.bind(function(tag){
            var contextTag = this.tagInvertedIndex[tag];
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
                payload.list.push({name: adjacentNode, type: 'adjacent', count: this.tagInvertedIndex[adjacentNode].count});
                payload.map[adjacentNode] = { type: 'adjacent' };
            }, this));
        }
    }
    else {
        contextTags.forEach(_.bind(function(tag){
            var contextTag = this.tagInvertedIndex[tag];
            if(contextTag){
                var adjacent = contextTag.adjacent;
                adjacent.forEach(_.bind(function(adjacentNode){
                    payload.list.push({name: adjacentNode, type: 'adjacent', count: this.tagInvertedIndex[adjacentNode].count});
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
            var tag = this.tagInvertedIndex[tag];
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
