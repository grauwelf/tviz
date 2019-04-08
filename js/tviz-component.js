/**
 * Visual component
 */

function TvizComponent(container, width, height) {
    if (arguments.length < 2) {
        width = container.attr('width');
        height = container.attr('height'); 
    }
    this.dim = {width: width, height: height};
    this.container = container;    
    this.scene = container.append('scene');
    this._data = {network: {}, map: {}};
}

TvizComponent.prototype.render = function() {
    console.log(this);
};

TvizComponent.prototype.projection = function(coordinates) {
    return coordinates;
};

TvizComponent.prototype.scale = d3.scaleLinear();

TvizComponent.prototype.data = function(values) {
    if(!arguments.length) {
        return this._data;
    } else {
        this._data = values;
        this.prepareData();
    }
};

TvizComponent.prototype.prepareData = function() {
    var map = this.data().map;
    var network = this.data().network;
    projection.fitSize([this.dim.width, this.dim.height], map);
    
    var nodes = [];
    network.nodes.forEach(function (data) {
        var coords = projection(data.geometry.coordinates);
        data.x = coords[0];
        data.y = coords[1];
        nodes[data.id] = data;
    });
    network.nodes = nodes;
    this._data = {
        network: network, 
        map: map
    };    
};


function TvizFlowMap(container, width, height) {
    TvizComponent.call(this, container, width, height);
}

TvizFlowMap.prototype = Object.create(TvizComponent.prototype);

TvizFlowMap.prototype.render = function () {
    var network = this.data().network;
    var map = this.data().map;
    
    var margin = {top: 20, right: 20, bottom: 20, left: 20};
    var width = this.dim.width - margin.left - margin.right;
    var height = this.dim.height - margin.top - margin.bottom;      
     
    var borders = d3.geoPath().projection(this.projection);
    
    this.container.selectAll('path')
        .data(map.features)
      .enter()
      .append('path')
        .attr('class', 'scene-map')
        .attr('d', borders);
        
    var connections = this.container.selectAll('.connect')
        .data(network.links, function (d) { 
            return (d.source && d.source.id) + '-' + (d.target && d.target.id); 
        })
      .enter()
      .append('line')
        //.attr('class', function (d) { return 'connect ' + d.line; })
        .attr('class', 'scene-edge')
        .attr('x1', function (d) { return d.source.x; })
        .attr('y1', function (d) { return d.source.y; })
        .attr('x2', function (d) { return d.target.x; })
        .attr('y2', function (d) { return d.target.y; });
    
    var stations = this.container.selectAll('.station')
        .data(Object.values(network.nodes), function (d) { return d.name; })
      .enter()
      .append('circle')
        //.attr('style', "fill: #ff0000")
        //.attr('class', function (d) { return 'station middle station-label ' + d.id; })
        .attr('class', 'scene-node')
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; })
        .attr('r', 1);
    
}