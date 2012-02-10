collect.Index = function(){
  this.data = {};
}

collect.Index.prototype.add = function(items, datumIndex){

  //TODO - generalize common functionality in *.add 
  var delegate = function(item, index){

    var context = [item];

    if(!this.data[item]){
      this.data[item] = {count: 1, indexes: [datumIndex]}
    }
    else {
      var item = this.data[item];
      item.count++;
      item.indexes.push(datumIndex);
    }
  }

  items.forEach(_.bind(delegate, this));

}

collect.TagIndex = function(){
    this.constructor.superClass_.constructor();
}

goog.inherits(collect.TagIndex, collect.Index);

collect.TagIndex.prototype.add = function(items, datumIndex){

  var delegate = function(item, index){

    var context = [item];
    var adjacentTags = _.difference(items, context);

    if(!this.data[item]){
      this.data[item] = {count: 1, indexes: [datumIndex], adjacent: adjacentTags}
    }
    else {
      var item = this.data[item];
      item.count++;
      item.indexes.push(datumIndex);
      item.adjacent = _.unique(item.adjacent.concat(adjacentTags));
    }
  }

  items.forEach(_.bind(delegate, this));

}


