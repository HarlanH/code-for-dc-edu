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
$.getJSON('clusters.geojson', function(data){
    geojson = L.geoJson(data).addTo(neighmap);
});
