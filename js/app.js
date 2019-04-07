/**
 * Entry point of application
 */

var projection = d3.geoMercator();

var svg = d3.select(".container")
  .append("svg")
    .attr('width', 650)
    .attr('height', 650)
    .call(d3.zoom().scaleExtent([1/16, 16]).on("zoom", zoomed));    

var g = svg.append("g"); 

function zoomed() {
    g.attr("transform", d3.event.transform);
}

var tvizMap = new TvizFlowMap(g, svg.attr('width'), svg.attr('height'));

var tvizModel = new TvizModel();
tvizModel.projection = projection;
tvizModel.load(["json!data/israel.geojson",
    "json!data/stations.geojson",
    "json!data/links.geojson"])
    .done(function() {
        tvizMap.projection = projection;
        tvizMap.data({
            network: tvizModel.network, 
            map: tvizModel.map
        });       
        tvizMap.render();
   });

