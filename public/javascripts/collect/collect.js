DEBUG = {
    performance: true
}

$(document).ready(function(){
    collect.doc = $(document);//root reference for event bind/trigger
    collect.links.success(function(data){
        collect.utility.time('TIME: Collection Create');
        collect.model = new collect.Model(data);
        collect.app = new collect.application();
        Backbone.history.start()
        $('body').addClass('loaded');
        collect.utility.timeEnd('TIME: Collection Create');
    });
    collect.links.error(function(data){
        console.log('error');
    });
});

