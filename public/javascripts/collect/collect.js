DEBUG = {
    performance: true
}

$(document).ready(function(){
    collect.doc = $(document);//root reference for event bind/trigger
    collect.links.success(function(data){
        collect.utility.time('TIME: Model Create');
        collect.model = new collect.Model(data);
        collect.utility.timeEnd('TIME: Model Create');
        collect.utility.time('TIME: Application Create');
        collect.app = new collect.application();
        Backbone.history.start()
        collect.utility.timeEnd('TIME: Application Create');
        $('body').addClass('loaded');
    });
    collect.links.error(function(data){
        console.log('error');
    });
});

