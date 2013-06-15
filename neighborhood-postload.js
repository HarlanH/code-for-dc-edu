$(document).ready(function() {
// Handler for .ready() called.

});

//var map = L.map('map').setView([38.895111, -77.036667], 11);
var neighmap = L.map('neighmap').setView([38.895111, -77.036667], 11);

L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
}).addTo(neighmap);


// draw neighborhood boundaries on neighborhood map and attach event listeners
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = props ? props.NBH_NAMES : "Hover over a Neighborhood Cluster";
};

info.addTo(neighmap);

function style(feature) {
    return {
        fillColor: 'grey',
        weight: 2,
        opacity: .7,
        color: 'white',
        //dashArray: '3',
        fillOpacity: 0.7
    };
}
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        opacity: 1
        //color: '#666',
        //dashArray: '',
        //fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}
function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight//,
        //click: zoomToFeature
    });
}
var geojson;
$.getJSON('clusters.geojson', function(data){
    geojson = L.geoJson(data, {style: style, onEachFeature: onEachFeature}).addTo(neighmap);
});

