var casper = require('casper').create({
  verbose: true,
  logLevel: 'debug'
});

var links = require('./tests/data').testData;

var t = casper.test;

function noop(){};

casper.start('http://localhost:3000', function(self){
  this.waitForSelector('div#links div.links', noop, noop, 500000);
});

var payload;
casper.then(function(self){

  this.test.assertEval(function() {
    var links = document.querySelectorAll('div.links ul li');
    if(collect.model.data.length > collect.PAGE_LENGTH){
      return links.length === collect.PAGE_LENGTH;
    }
    else {
      return links.length === collect.model.data.length;
    }
  }, 'Page has correct number of links');

  this.test.assertEval(function() {
    var links = document.querySelectorAll('div.links ul li');
    if(links.length > collect.PAGE_LENGTH){
      var pagination = document.querySelectorAll('div.pagination div.pagination')[0];
      return pagination.childNodes.length === 2 + Math.ceil(collect.model.data.length / collect.PAGE_LENGTH);
    }
    else {
      return true;
    }
  }, 'Pagination has correct number of elements');

});

casper.run();

