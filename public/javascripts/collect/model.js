;"use strict";

collect.Model = function(callback){

    var callback = _.bind(function(data){
        this.data = data;
        this.tagDict = {};
        this.Context = Backbone.Model.extend();
        this.context = new this.Context();
        this.LinkCollection = Backbone.Collection.extend();
        this.linkCollection = new this.LinkCollection();
        this.Link = Backbone.Model.extend();
        this.Tag = Backbone.Model.extend();
        this.data.forEach(goog.bind(this.createLink, this));
        this.sortTags();
        collect.doc.trigger('/model/load');
    }, this);

    var db = new collect.db(callback);

}

collect.Model.prototype.createLink = function(datum, index, array){

    var link = new this.Link({
        couchId: datum.couchId,
        couchRev: datum.couchRev,
        dateCreated: datum.dateCreated,
        uri: datum.uri,
        title: datum.title,
        tags: datum.tags
    });

    this.linkCollection.add(link);

    if(datum.tags){
        this.createTagStructures(datum.tags, index);
    }

}

collect.Model.prototype.createTagStructures = function(tags, datumIndex){

    var delegate = function(tag, index, array){
        
        var context = [tag];
        var adjacentTags = _.difference(tags, context);

        if(!this.tagDict[tag]){
            this.tagDict[tag] = {count: 1, indexes: [datumIndex], adjacent: adjacentTags}
        }
        else {
            var tag = this.tagDict[tag];
            tag.count++;
            tag.indexes.push(datumIndex);
            tag.adjacent = _.unique(tag.adjacent.concat(adjacentTags));
        }
    }

    delegate = goog.bind(delegate, this);
    tags.forEach(delegate);

}

collect.Model.prototype.getMultipleAdjacency = function(){
    var args = arguments;
}

collect.Model.prototype.sortTags = function(){

    this.sortedTags = []
    for(var tag in this.tagDict){
        this.tagDict[tag].adjacent = this.tagDict[tag].adjacent.sort();
        this.sortedTags.push({name: tag, value: this.tagDict[tag].count});
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
    //TODO - bind handlers, remove closure
    var model = this;
    var payload = {
        list: [],
        map: {}
    };
    contextTags.forEach(function(context){
        if(context && model.tagDict[context]){
            payload.list.push({name: context, type: 'active', count: model.tagDict[context].count});
            payload.map[context] = { type: 'active' };
        }
    });

    if(contextTags.length > 1){
        var intersection;
        contextTags.forEach(function(tag){
            var contextTag = model.tagDict[tag];
            if(contextTag){
                if(!intersection){
                    intersection = contextTag.adjacent;
                }
                else {
                    intersection = _.intersection(intersection, contextTag.adjacent);
                }
            }
        });
        if(intersection){
            intersection.forEach(function(adjacentNode){
                payload.list.push({name: adjacentNode, type: 'adjacent', count: model.tagDict[adjacentNode].count});
                payload.map[adjacentNode] = { type: 'adjacent' };
            });
        }
    }
    else {
        contextTags.forEach(function(tag){
            var contextTag = model.tagDict[tag];
            if(contextTag){
                var adjacent = contextTag.adjacent;
                adjacent.forEach(function(adjacentNode){
                    payload.list.push({name: adjacentNode, type: 'adjacent', count: model.tagDict[adjacentNode].count});
                    payload.map[adjacentNode] = { type: 'adjacent' };
                });
            }
        });
    }

    return payload;
}

collect.Model.prototype.contextLinks  = function(contextTags){
    //TODO - bind handlers, remove closure
    var model = this;
    if(contextTags.length === 1 && contextTags[0] === 'all'){
        return model.linkCollection.toJSON();
    }
    else{ 
        var tagIndexes = [];
        contextTags.forEach(function(tag, index, items){
            var tag = model.tagDict[tag];
            if(tag){
                var subList = tag.indexes;
                tagIndexes.push(subList);
            }
        });

        var indexes;
        if(contextTags.length > 1){
            var intersection = _.intersection.apply({}, tagIndexes);
            indexes = intersection;
        }
        else {
            indexes = tagIndexes[0];
        }

        if(indexes){
            var temp = [];
            indexes.forEach(function(contextIndex, index, items){
                var link = model.linkCollection.at(contextIndex);
                temp.push(link.toJSON());
            });
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
