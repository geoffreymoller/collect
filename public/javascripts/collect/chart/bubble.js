;"use strict";

function BubbleChart(data, threshold){

  var threshold;

  this.__defineGetter__('threshold', function(prop) {
    return threshold;
  });

  this.__defineSetter__('threshold', function(prop) {
    threshold = prop;
    this.render();
  });

  this.data = data;
  this.$node = $('#chart');

  this.threshold = threshold || BubbleChart.DEFAULT_THRESHOLD;

  collect.doc.bind('/chart/bubble/threshold', _.bind(function(e, val){
    this.threshold = val;
  }, this));

}

BubbleChart.DEFAULT_THRESHOLD = 2;

BubbleChart.prototype.render = function(){

    collect.utility.time('TIME: BubbleChart::render');

    this.$node.empty();

    var r = 760,
        format = d3.format(",d"),
        fill = d3.scale.category20c();

    var bubble = d3.layout.pack()
        .sort(null)
        .size([r, r]);

    var vis = d3.select('#' + this.$node.attr('id')).append("svg:svg")
        .attr("width", r)
        .attr("height", r)
        .attr("class", "bubble");

    var data = { children: this.data };

    var node = vis.selectAll("g.node")
        .data(bubble.nodes(data)
        .filter(_.bind(function(d) { return !d.children && d.value >= this.threshold; }, this)))
        .enter().append("svg:g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    node.on('click', function(e){
        var tag = e.name;
        collect.doc.trigger('/chart/bubble/click', tag);
    });

    node.append("svg:title")
        .text(function(d) { return d.name + ": " + format(d.value); });

    node.append("svg:circle")
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return fill(d.name); });

    node.append("svg:text")
        .attr("text-anchor", "middle")
        .attr("dy", ".3em")
        .text(function(d) { return d.name.substring(0, d.r / 3); });

    collect.utility.timeEnd('TIME: BubbleChart::render');

}

