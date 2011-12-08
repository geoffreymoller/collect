collect.application = Backbone.Router.extend({

    initialize: function(){
        this.listen();
    },

    routes: {
        "": "root",
        "tags/:tags/:page": "tag",
        "tags/:tags": "tag",
        "vis/:type": "vis"
    },

    views: {

        TopbarView: Backbone.View.extend({
            template: "#topbar-template",
            render: function(layout) {
                return layout(this).render();
            }
        }),

        VisView: Backbone.View.extend({
            template: "#vis-template",
            render: function(layout) {
                return layout(this).render();
            }
        }),

        LinksView: Backbone.View.extend({
            template: "#links-template",
            render: function(layout) {
                return layout(this).render(this.model);
            }
        })

    },

    root: function() {
        this.navigate('tags/all', true);
    },

    tag: function(contextTags, page) {

        collect.utility.time('TIME: Route: tag');

        var model = collect.model;
        model.context.set({'context': contextTags});
        var contextTags = contextTags.split('+');
        //TODO - memoize these:
        var relatedTags = model.relatedTags(contextTags);
        var contextLinks = model.contextLinks(contextTags); 

        var pagination = new collect.pagination(page);
        var links = new Backbone.LayoutManager({
            name: "#main-layout",
            views: {
                ".topbar": new this.views.TopbarView(),
                "#links": new this.views.LinksView({model: {
                    tags: model.sortedTags, 
                    relatedTags: relatedTags, 
                    links: contextLinks.slice(pagination.start, pagination.end), 
                    contextTags: model.context.get('context') || 'all'}
                })
            }
        });

        links.render(function(contents) {
            $("div#wrapper")
            .html(contents)
            .removeClass('vis')
            .addClass('tags')
        });  

        pagination.paint(this, contextLinks, contextTags);
        collect.utility.timeEnd('TIME: Route: tag');

    },

    vis: function(type) {

        collect.utility.time('TIME: Route: vis');

        var vis = new Backbone.LayoutManager({
            name: "#main-layout",
            views: {
                ".topbar": new this.views.TopbarView(),
                "#vis": new this.views.VisView(),
            }
        });

        vis.render(function(contents) {
            $("div#wrapper")
            .html(contents)
            .removeClass('tags')
            .addClass('vis')
        });  

        switch(type){
            case 'bubble':
                var chart = new BubbleChart();
                chart.render(collect.model.sortedTags);
                collect.doc.bind('/chart/bubble/click', function(e, tag){
                    collect.app.navigate('tags/' + tag, true);
                }); 
            return false;
        }

        collect.utility.timeEnd('TIME: Route: vis');
    },

    listen: function(){
        //TODO - listeners to views
        var app = this;
        $(document).on('keypress', function(e){
            if(e.charCode === 47){
                $('#search input').focus();
                e.preventDefault();
            }
            if(e.charCode === 13 && e.target.id === 'searchText'){
                var search = e.target.value;
                app.navigate('tags/' + search, true);
                $(e.target).select();
                $(document.body).scrollTop(0)
            }
        });
        $(document).on('click', 'a[href*="/#tags"], span.add, span.subtract', function(e){
            $(document.body).scrollTop(0);
        });
        $(document).on('click', 'span.add', function(e){
            var tag = $(this).parent().attr('id').split('-')[1];
            var _context = collect.model.context.get('context');
            if(_context === 'all'){
                app.navigate('tags/' + tag, true);
            }
            else{
                app.navigate('tags/' + _context + '+' + tag, true);
            }

        });
        $(document).on('click', 'span.subtract', function(e){
            var tag = $(this).parent().attr('id').split('-')[1];
            var _context = collect.model.context.get('context').split('+');
            _context = _.reject(_context, function(contextTag){ return contextTag === tag });
            if(_context.length === 0){
                app.navigate('', true);
            }
            else{
                _context = _context.join('+');
                app.navigate('tags/' + _context, true);
            }
        });
    }

});

