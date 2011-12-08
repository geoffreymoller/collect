collect.DEBUG =  {
    performance: true
}

$(document).ready(function(){

    if(localStorage['lastUpdated']){
    }
    else {
        var auth = 'sessimingreadvandedsoner:GkeRd7NkGogRQEqWRfJjS6Wd';
        collect.links = $.getJSON('https://' + auth + '@geoffreymoller.cloudant.com/collect/_design/uri/_view/uri?descending=true&callback=?');
    }

    collect.doc = $(document);//root reference for event bind/trigger
    collect.links.success(function(data){
        collect.utility.time('TIME: Model Create');
        collect.model = new collect.Model(data);
        collect.utility.timeEnd('TIME: Model Create');
        collect.utility.time('TIME: Application Create');
        collect.app = new collect.Application();
        Backbone.history.start()
        collect.utility.timeEnd('TIME: Application Create');
        $('body').addClass('loaded');
    });
    collect.links.error(function(data){
        console.log('error');
    });
});

