/**
 * Visual components 
**/

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
     
    var smoothPath = d3.geoPath().projection(this.projection);
    
    this.container.selectAll('.scene-map')
        .data(map.features)
      .enter()
      .append('path')
        .attr('class', 'scene-map')
        .attr('d', smoothPath);
    
    var connections = this.container.selectAll('.scene-edge')
        .data(network.links)
      .enter()
      .append('path')
        .attr('class', 'scene-edge')
        .attr('d', function(d) {
            return smoothPath({
                'type': 'LineString',
                'coordinates': d.path
            });
        });
    
    var stations = this.container.selectAll('.scene-node')
        .data(Object.values(network.nodes), function (d) { return d.name; })
      .enter()
      .append('circle')
        .attr('class', function (d) { 
            return d.type == 'stop' ? 'scene-stop' : 'scene-node'; 
        })
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; })
        .attr('r', 2);
    
}