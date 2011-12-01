DEBUG = {
    performance: true
}

$(document).ready(function(){
    collect.doc = $(document);//root reference for event bind/trigger
    collect.links.success(function(data){
        collect.utility.time('TIME: Collection Create');
        var model = new collect.Model(data);
        var app = new collect.application(model);
        $('body').addClass('loaded');
        collect.utility.timeEnd('TIME: Collection Create');
    });
    collect.links.error(function(data){
        console.log('error');
    });
});

