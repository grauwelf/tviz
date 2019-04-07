/**
 * Entry point of application
 */

var projection = d3.geoMercator()
    .scale(10000)
    .center([35.2137, 31.7683]);

var tvizModel = new TvizModel();
tvizModel.projection = projection;
tvizModel.load(["json!data/israel.geojson",
    "json!data/stations.geojson",
    "json!data/links.geojson"])
    .done(function() {
        console.log(tvizModel);
        var svg = d3.select(".container")
          .append("svg")
            .attr('width', 600)
            .attr('height', 600)
            .call(d3.zoom().scaleExtent([1 / 2, 4]).on("zoom", zoomed));    
        var g = svg.append('g');
        drawMap(g, tvizModel.network, 500, 600);
    });


// Render the map given a particular width and height
function drawMap(container, network, outerWidth, outerHeight) {
  // Setup geometry of the map
  var margin = {top: 20, right: 20, bottom: 20, left: 20};
  var nodesValues = Object.values(network.nodes);
  var xRange = d3.extent(nodesValues, function (d) { return d.x; });
  var yRange = d3.extent(nodesValues, function (d) { return d.y; });
  var width = outerWidth - margin.left - margin.right;
  var height = outerHeight - margin.top - margin.bottom;
  var xScale = width / (xRange[1] - xRange[0]);
  var yScale = height / (yRange[1] - yRange[0]);
  var scale = Math.min(xScale, yScale);
  scale = 1;
  var terminalNodeRadius = 0.2 * scale;
 
  // Scale nodes positions
  network.nodes.forEach(function (data) {
      data.pos = [data.x * scale, data.y * scale];
  });
  
  var borders = d3.geoPath().projection(tvizModel.projection);
  

  container.selectAll("path")
    .data(tvizModel.map.features)
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("d", borders)
  
  container.attr('width', Math.max(250, scale * (xRange[1] - xRange[0]) + margin.left + margin.right))
      .attr('height', scale * (yRange[1] - yRange[0]) + margin.top + margin.bottom)
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var stations = container.selectAll('.station')
      .data(nodesValues, function (d) { return d.name; })
      .enter()
      .append('circle')
      .attr('style', "fill: #ff0000")
      .attr('class', function (d) { return 'station middle station-label ' + d.id; })
      .attr('cx', function (d) { return d.pos[0]; })
      .attr('cy', function (d) { return d.pos[1]; })
      .attr('r', 2);
  
  var connections = container.selectAll('.connect')
      .data(network.links, function (d) { 
          return (d.source && d.source.id) + '-' + (d.target && d.target.id); 
      })
      .enter()
      .append('line')
      .attr('class', function (d) { return 'connect ' + d.line; })
      .attr('x1', function (d) { return d.source.pos[0]; })
      .attr('y1', function (d) { return d.source.pos[1]; })
      .attr('x2', function (d) { return d.target.pos[0]; })
      .attr('y2', function (d) { return d.target.pos[1]; });

}

function zoomed() {
    var transform = d3.zoomTransform(this);
    d3.select("svg")
    .attr("transform", "translate(" + transform.x + "," + transform.y + ") scale(" + transform.k + ")");
}
