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

    pagination: {
        PAGE_LENGTH: 20,
        pre: function(page){
            var page = page ? page - 1 : 0;
            var start, end;
            start = page * this.PAGE_LENGTH;
            if(page === 0){
                end = 9;
            }
            else {
                end = start + this.PAGE_LENGTH - 1;
            }
            return {
                PAGE_LENGTH: this.PAGE_LENGTH,
                start: start,
                end: end
            }
        },
        post: function(contextLinks, contextTags, page){

            function pageSelectCallback(index, params){
                var index = parseInt(index);
                index++;
                var predicate = contextTags.join(',') + '/' + index;
                this.navigate('tags/' + predicate, true);
                return false;
            }

            if(contextLinks.length > this.PAGE_LENGTH){
                 $(".pagination").pagination(contextLinks.length, {
                    callback: _.bind(pageSelectCallback, this),
                    current_page: page, 
                    num_display_entries: 20,
                    num_edge_entries: 1,
                    items_per_page: this.PAGE_LENGTH
                });
            }
        }
    },

    tag: function(contextTags, page) {

        collect.utility.time('TIME: Route: tag');

        var model = collect.model;
        model.context.set({'context': contextTags});

        var paginate = this.pagination.pre(page);
        var contextTags = contextTags.split('+');
        //TODO - memoize these:
        var relatedTags = model.relatedTags(contextTags);
        var contextLinks = model.contextLinks(contextTags); 

        var links = new Backbone.LayoutManager({
            name: "#main-layout",
            views: {
                ".topbar": new this.views.TopbarView(),
                "#links": new this.views.LinksView({model: {
                    tags: model.sortedTags, 
                    relatedTags: relatedTags, 
                    links: contextLinks.slice(paginate.start, paginate.end), 
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

        this.pagination.post(contextLinks, contextTags, page);

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

