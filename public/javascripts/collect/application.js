;"use strict";

collect.Application = Backbone.Router.extend({

    initialize: function(){
        this.listen();
        Handlebars.registerHelper('date_string', function(milliseconds) {
          return collect.Model.formatDate(milliseconds);
        });
        Handlebars.registerHelper('truncate', function(text, chars) {
          return goog.string.truncate(text, chars); 
        });
        Handlebars.registerHelper('note', function(noteText) {
          var s = '<div class="note less">';
          s += html_sanitize(noteText);
          if(noteText.length > 200){
            s += '<div class="moreless"><div></div></div>';
          }
          s += '</div>';
          return s; 
        });
        collect.doc.bind('/link/delete/success', function(){
            Backbone.history.loadUrl(Backbone.history.fragment);
        });
        Backbone.LayoutManager.configure({
          render: function(template, context) {
            var result = Handlebars.compile(template)(context);
            return result; 
          }
        });
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
            },
            events: {
                "click .delete": "deleteHandler",
                "click .moreless": "morelessHandler",
                "click span.add": "addHandler",
                "click span.subtract": "subtractHandler",
                "click a[href*='/#tags'], span.add, span.subtract": "scrollHandler"
            },
            scrollHandler: function(){
                $(document.body).scrollTop(0);
            },
            addHandler: function(e){
              var tag = $(e.target).parent().attr('id').split('-')[1];
              var _context = collect.model.context.get('context');
              if(_context === 'all'){
                  collect.app.navigate('tags/' + tag, true);
              }
              else{
                  collect.app.navigate('tags/' + _context + '+' + tag, true);
              }
            },
            subtractHandler: function(e){
              var tag = $(e.target).parent().attr('id').split('-')[1];
              var _context = collect.model.context.get('context').split('+');
              _context = _.reject(_context, function(contextTag){ return contextTag === tag });
              if(_context.length === 0){
                  collect.app.navigate('', true);
              }
              else{
                  _context = _context.join('+');
                  collect.app.navigate('tags/' + _context, true);
              }
            },
            morelessHandler: function(e){
              var target = $(e.target);
              var note = target.parents('.note');
              note.toggleClass('more')
              .toggleClass('less');
            },
            deleteHandler: function(e){
                e.preventDefault();
                var _delete = confirm('Are you sure you want to delete this link?');
                if(_delete){
                    //TODO - bind individual links to models instead of hacking the data from the view layer,
                    //reconcile Model.prototype.delete;
                    var target = $(e.target);
                    target.parent().fadeOut();
                    var href = target.attr('href');
                    var parts = href.split('/');
                    var id = parts[2];
                    var rev = parts[3];
                    collect.model.delete(id, rev);
                }
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
        var relatedTags = model.relatedTags(contextTags);
        var contextLinks = model.contextLinks(contextTags); 
        contextLinks = contextLinks.filter(function(link){
            return !!!link.deleted;
        });

        var pagination = new collect.pagination(page);
        var links = new Backbone.LayoutManager({
            name: "#main-layout",
            views: {
                ".topbar": new this.views.TopbarView(),
                "#links": new this.views.LinksView({model: {
                    tags: model.sortedTags.filter(function(tag){
                        return !!!relatedTags.map[tag.name];
                    }), 
                    relatedTags: relatedTags, 
                    links: contextLinks.slice(pagination.start, pagination.end), 
                    contextTags: model.context.get('context').replace(/\+/g, ' AND ')  || 'all'}
                })
            }
        });

        links.render(function(contents) {
            $("div#wrapper")
            .html(contents)
            .removeClass('vis')
            .addClass('tags')
        });  

        pagination.paint(contextLinks.length, _.bind(function(index) {
            var index = parseInt(index);
            index++;
            var predicate = contextTags.join(',') + '/' + index;
            this.navigate('tags/' + predicate, true);
        }, this));

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
        $(document).on('keypress', _.bind(function(e){
            if(e.charCode === 47){
                $('#search input').focus();
                e.preventDefault();
            }
            if(e.charCode === 13 && e.target.id === 'searchText'){
                var search = e.target.value;
                this.navigate('tags/' + search, true);
                $(e.target).select();
                $(document.body).scrollTop(0)
            }
        }, this));
    }

});

