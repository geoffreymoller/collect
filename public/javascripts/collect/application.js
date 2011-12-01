collect.application = function(model){

    var Workspace = Backbone.Router.extend({

        initialize: function(){
            this.listen();
        },

        routes: {
            "": "root",
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
            workspace.navigate('tags/', true);
        },

        tag: function(contextTags) {

            model.context.set({'context': contextTags});
            contextTags = contextTags.split('+');
            var relatedTags = model.relatedTags(contextTags);
            var contextLinks = model.contextLinks(contextTags); 

            var links = new Backbone.LayoutManager({
                name: "#main-layout",
                views: {
                    ".topbar": new this.views.TopbarView(),
                    "#links": new this.views.LinksView({model: {
                        tags: model.sortedTags, 
                        relatedTags: relatedTags, 
                        links: contextLinks,
                        contextTags: model.context.get('context') || '*'
                    }
                    })
                }
            });

            links.render(function(contents) {
                $("body")
                .html(contents)
                .removeClass('vis')
                .addClass('tags')
            });  

        },


        vis: function(type) {

            var vis = new Backbone.LayoutManager({
                name: "#main-layout",
                views: {
                    ".topbar": new this.views.TopbarView(),
                    "#vis": new this.views.VisView(),
                }
            });

            vis.render(function(contents) {
                $("body")
                .html(contents)
                .removeClass('tags')
                .addClass('vis')
            });  

            switch(type){
                case 'bubble':
                    var chart = new BubbleChart();
                    chart.render(model.sortedTags);
                    collect.doc.bind('/chart/bubble/click', function(e, tag){
                        workspace.navigate('tags/' + tag, true);
                    }); 
                return false;
            }
        },

        listen: function(){
            //TODO - listeners to views
            $(document).on('keypress', function(e){
                if(e.charCode === 47){
                    $('#search input').focus();
                    e.preventDefault();
                }
                if(e.charCode === 13 && e.target.id === 'searchText'){
                    var search = e.target.value;
                    workspace.navigate('tags/' + search, true);
                    $(e.target).select();
                    $(document.body).scrollTop(0)
                }
            });
            $(document).on('click', 'a[href*="/#tags"], span.add, span.subtract', function(e){
                $(document.body).scrollTop(0);
            });
            $(document).on('click', 'span.add', function(e){
                var tag = $(this).parent().attr('id').split('-')[1];
                var _context = model.context.get('context');
                if(_context === '*'){
                    workspace.navigate('tags/' + tag, true);
                }
                else{
                    workspace.navigate('tags/' + _context + '+' + tag, true);
                }

            });
            $(document).on('click', 'span.subtract', function(e){
                var tag = $(this).parent().attr('id').split('-')[1];
                var _context = model.context.get('context').split('+');
                _context = _.reject(_context, function(contextTag){ return contextTag === tag });
                if(_context.length === 0){
                    workspace.navigate('', true);
                }
                else{
                    _context = _context.join('+');
                    workspace.navigate('tags/' + _context, true);
                }
            });
        }



    });

    var workspace = new Workspace();
    Backbone.history.start()

}

