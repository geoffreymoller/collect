var f = require('foounit').globalize();
var http = require('http');

describe("API", function() {

  describe("Links", function() {

    it('Should return links via CouchDB', function(){

      var options = {
        host: 'geoffreymoller.cloudant.com',
        port: 80,
        path: '/collect/_design/uri/_view/uri'
      };

      http.get(options, function(res) {
        expect(res.statusCode).to(be, 200);
      })

    });

  });

});

f.run();
