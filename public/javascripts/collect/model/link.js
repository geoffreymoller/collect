collect.Link = function(link){
  var data = link.value;
  data.couchId = link.id;
  data.couchRev = link.value.rev;
  data.tags = data.tags ? link.value.tags.sort() : [];
  data.dateCreatedDesc = 10000000000000000 - link.value.date_created;
  return data;
}
