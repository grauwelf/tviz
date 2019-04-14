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
    // Multiplier 1.5 is needed to clip map of Israel
    projection.fitSize([this.dim.width, 1.5*this.dim.height], map);
    
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

TvizFlowMap.prototype.render = function (time) {
    if (arguments.length == 0) {
        time = moment().hour();
    }
    
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
    
    connections.each(function(element, idx) {
        var source = d3.select(this).data()[0].source;
        var target = d3.select(this).data()[0].target;
        if (network.nodes[source.id].paths === undefined) {
            network.nodes[source.id].paths = [];
        }
        if (network.nodes[target.id].paths === undefined) {
            network.nodes[target.id].paths = [];
        }
        network.nodes[source.id].paths.push(d3.select(this));
        network.nodes[target.id].paths.push(d3.select(this));       
    });
    
    connections.each(function(element, idx) {
        var simulationRate = 5;        
        var connectionLoad = d3.select(this).data()[0].loads[time];
        for (var i = 0; i < 5/*connectionLoad*/; i++) {
            var circle = g.append('circle')
                .attr('class', 'vehicle')
                .attr('fill', '#ff0000')
                .attr('r', 1);
            moveAlong(d3.select(this), circle, i+1, simulationRate);
        }
    });           
    
    function moveAlong(path, element, number, rate) {
        if (path === undefined) {
            return true;
        }
        var offset = 2*(number - 1);
        var duration = 1000 * path.node().getTotalLength() / rate;
        var p = path.node().getPointAtLength(offset);
        element.transition()
            .attr('transform', 'translate(' + p.x + ',' + p.y + ')');        
        element.transition()
            .duration(duration)
            .ease(d3.easeLinear)
            .attrTween('transform', translateAlong(path.node(), offset, 1))
            .on('end', function() {
                moveAlong(path, element, number, rate);               
            });          
    }

    function translateAlong(path, offset, direction) {
      var l = path.getTotalLength();
      return function(d, i, a) {
        return function(t) {    
            atLength = direction === 1 ? (t * l) - offset : (l - (t * l)) + offset;
            var p = path.getPointAtLength(atLength);
            return 'translate(' + p.x + ',' + p.y + ')';
        };
      };
    }
    
    var tooltip = d3.tip().html(function(d) {
        return d.type == 'node' ? '<em>' + 'צומת' + '</em></br>' + d.id : d.name + '</br>' + d.id;
    }).attr('class', 'scene-node-tooltip');
    
    var stations = this.container.selectAll('.scene-node')
        .data(Object.values(network.nodes), function (d) { return d.name; })
      .enter()
      .append('circle')
        .attr('class', function (d) { 
            return d.type == 'stop' ? 'scene-stop' : 'scene-node'; 
        })
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; })
        .attr('r', 2)
        .on('mouseover', tooltip.show)
        .on('mouseout', tooltip.hide);
    
    stations.call(tooltip);
    
}