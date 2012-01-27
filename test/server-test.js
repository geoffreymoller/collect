var should = require('should'),
    http = require('http'),
    server = require('../server');

describe("API", function() {

  describe("Links", function() {

    it('Should return links via CouchDB', function(done){

      var options = {
        host: 'geoffreymoller.cloudant.com',
        port: 80,
        path: '/collect/_design/uri/_view/uri'
      };

      http.get(options, function(res) {
        res.statusCode.should.equal(200);
        done();
      })

    });

  });

});
