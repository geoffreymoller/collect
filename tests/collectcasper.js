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
  this.click('div.pagination a');
  t.assertEquals('foo', 'foo', 'foo == foo');
  t.assert('foo' !== 'bar', 'foo !== bar');
  t.assertType('foo', 'string', 'foo is a string');
});

casper.run();

