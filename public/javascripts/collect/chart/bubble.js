function BubbleChart(){ }

BubbleChart.prototype.render = function(data){

    collect.utility.time('TIME: BubbleChart::render');

    var r = 760,
        format = d3.format(",d"),
        fill = d3.scale.category20c();

    var bubble = d3.layout.pack()
        .sort(null)
        .size([r, r]);

    var vis = d3.select("#chart").append("svg:svg")
        .attr("width", r)
        .attr("height", r)
        .attr("class", "bubble");

    data = { children: data };

    var node = vis.selectAll("g.node")
        .data(bubble.nodes(data)
        .filter(function(d) { return !d.children; }))
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

