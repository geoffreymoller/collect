var casper = require('casper').create({
  verbose: true,
  logLevel: 'debug'
});

var t = casper.test;

function noop(){};

casper.start('http://localhost:3000', function(self){
  this.waitForSelector('div#links div.links', noop, noop, 500000);
});

var payload;
casper.then(function(self){
  this.test.assertEval(function() {
    return document.querySelectorAll('div.links ul li').length === collect.PAGE_LENGTH;
  }, 'Page has correct number of links');
});

casper.run();

