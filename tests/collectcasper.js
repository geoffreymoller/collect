var casper = require('casper').create({
  verbose: true,
  logLevel: 'debug'
});

var __ = require('./tests/underscore-min')

var links = require('./tests/data').testData;
var config = require('./conf').configuration;

var tagDict = {};
__.each(links, function(link){
  __.each(link.tags, function(tag){
    if(tagDict[tag]){
      tagDict[tag]++;
    }
    else {
      tagDict[tag] = 1;
    }
  });
});

var t = casper.test;

function noop(){};

casper.start('http://localhost:3000', function(self){
  this.waitForSelector('div#links div.links', noop, noop, 500000);
});

casper.thenEvaluate(function(term) {
  $('body').attr('length.js', term);
}, { term: tagDict.javascript });

var payload;
casper.then(function(self){

  this.test.assert(/^\d+$/.test(config.PAGE_LENGTH), 'Configuration PAGE_LENGTH is set and is an integer');

  this.test.assertEval(function() {
    return $('#tag-javascript span.count').html() === $('body').attr('length.js');
  }, 'Javascript tag has correct count');

  this.test.assertEval(function() {
    var links = $('div.links ul li');
    if(collect.model.data.length > collect.options.PAGE_LENGTH){
      return links.length === collect.options.PAGE_LENGTH;
    }
    else {
      return links.length === collect.model.data.length;
    }
  }, 'Page has correct number of links');

  //Pagination
  if(links.length > config.PAGE_LENGTH){

    this.test.assertEval(function() {
      var pagination = $('div.pagination div.pagination')[0];
      return pagination.childNodes.length === 2 + Math.ceil(collect.model.data.length / collect.options.PAGE_LENGTH);
    }, 'Pagination has correct number of elements');

    this.test.assertEval(function() {
      var pagination = $('div.pagination div.pagination')[0];
      var children = pagination.childNodes;
      var isValidPagination = children[0].className === 'current prev' &&
      children[1].className === 'current' &&
      children[children.length - 1].className === 'next';
      return isValidPagination;
    }, 'Pagination has correct CSS styles');

    casper.click('a.next');

    function pageLinks() {
      var links = $('div.links ul li');
      return links.length === collect.options.PAGE_LENGTH;
    }

    this.test.assertEval(pageLinks, 'Second page has correct number of links');
    casper.click('a.next');
    this.test.assertEval(pageLinks, 'Third page has correct number of links');

  }

});

casper.run();

