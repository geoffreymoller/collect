collect.DEBUG =  {
    performance: true
}

$(document).ready(function(){

    if(localStorage['lastUpdated']){
    }
    else {
        var auth = 'sessimingreadvandedsoner:GkeRd7NkGogRQEqWRfJjS6Wd';
        collect.links = $.getJSON('https://' + auth + '@geoffreymoller.cloudant.com/collect/_design/uri/_view/uri?callback=?');
    }

    collect.doc = $(document);//root reference for event bind/trigger
    collect.links.success(function(data){
        collect.utility.time('TIME: Collection Create');
        collect.model = new collect.Model(data);
        collect.app = new collect.Application();
        Backbone.history.start()
        $('body').addClass('loaded');
        collect.utility.timeEnd('TIME: Collection Create');
    });
    collect.links.error(function(data){
        console.log('error');
    });
});

