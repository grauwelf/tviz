/**
 * Entry point of application
 */

// Initialize projection
var projection = d3.geoMercator();

/*
 * Create SVG element inside given container.
 * SVG is created with basic zoom abilities.
 * Zoom works both with mouse-wheel and
 * double-click events. 
 */
var svg = d3.select('.container')
  .append('svg')
    .attr('width', 650)
    .attr('height', 650)
    .call(d3.zoom().scaleExtent([1/16, 16]).on('zoom', zoomed));    

var g = svg.append('g'); 

function zoomed() {
    g.attr('transform', d3.event.transform);
    g.selectAll('.scene-node,.scene-stop')
        .attr('r', 4 / d3.event.transform.k)
    g.selectAll('.scene-edge')
        .style('stroke-width', 1.5 / d3.event.transform.k);
}

/*
 * Create main component for drawing and 
 * load data to main data model object.
 * Data loads asynchronously and render 
 * starts when all data have been loaded.  
 * 
 * In order to build and render transport network
 * the following datasets need to be loaded:
 *     1) region boundaries;
 *     2) collection of GeoJSON features representing stop nodes;
 *     3) collection of GeoJSON features representing all nodes of transport network;  
 *     4) collection of GeoJSON features representing existing paths between nodes.
 */
var tvizMap = new TvizFlowMap(g, svg.attr('width'), svg.attr('height'));

var tvizModel = new TvizModel();
tvizModel.projection = projection;
tvizModel.load(['json!data/israel.geojson',
    'json!data/stops.geojson',
    'json!data/stations.geojson',
    'json!data/links.geojson'])
    .done(function() {
        tvizMap.projection = projection;
        tvizMap.data({
            network: tvizModel.network, 
            map: tvizModel.map
        });       
        tvizMap.render();
   });

