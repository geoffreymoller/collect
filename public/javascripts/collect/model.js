collect.Model = function(data){
    this.data = data;
    this.tagDict = {};
    this.Context = Backbone.Model.extend();
    this.context = new this.Context();
    this.LinkCollection = Backbone.Collection.extend();
    this.linkCollection = new this.LinkCollection();
    this.Link = Backbone.Model.extend();
    this.Tag = Backbone.Model.extend();
    this.data.rows.forEach(goog.bind(this.createDatum, this));
    this.sortTags();
}

collect.Model.prototype.createDatum = function(datum, index, array){

    var link = new this.Link({
        couchId: datum.id,
        date: datum.value.date,
        uri: datum.value.uri,
        title: datum.value.title,
        tags: datum.value.tags
    });

    this.linkCollection.add(link);

    if(datum.value.tags){
        this.createTagStructures(datum.value.tags, index);
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
    var payload = [];
    contextTags.forEach(function(context){
        if(context && model.tagDict[context]){
            payload.push({name: context, type: 'active', count: model.tagDict[context].count});
        }
        else {
            return payload;
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
                payload.push({name: adjacentNode, type: 'adjacent', count: model.tagDict[adjacentNode].count});
            });
        }
    }
    else {
        contextTags.forEach(function(tag){
            var contextTag = model.tagDict[tag];
            if(contextTag){
                var adjacent = contextTag.adjacent;
                adjacent.forEach(function(adjacentNode){
                    payload.push({name: adjacentNode, type: 'adjacent', count: model.tagDict[adjacentNode].count});
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