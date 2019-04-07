/**
 * Entry point of application
 */

var projection = d3.geoMercator()
    //.scale(10000)
    .center([35.2137, 31.7683]);

var svg = d3.select(".container")
  .append("svg")
    .attr('width', 700)
    .attr('height', 700)
    .call(d3.zoom().scaleExtent([1 / 2 , 4]).on("zoom", zoomed));    

var tvizMap = new TvizFlowMap(svg);

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

function zoomed() {
    var transform = d3.zoomTransform(this);
    d3.select("svg")
    .attr("transform", "translate(" + transform.x + "," + transform.y + ") scale(" + transform.k + ")");
}
