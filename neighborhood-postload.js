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
function displaySchools(e) {
	var layer = e.target;
	// get the schools for this cluster
	var cluster_id = parseInt(layer.feature.properties.GIS_ID.substring(8));
	console.log(cluster_id);
	var schools = getSchools(cluster_id);
	console.log(schools);
	// iterate, plot the points and lines
	for (i = 0; i < schools.length; i++) {
		if (typeof schools[i].lat === 'number') {
			var marker = L.circleMarker([schools[i].lat, schools[i].lon], {radius: 5+((schools[i].count<10)?0:Math.sqrt(schools[i].count))});
			//marker.addTo(neighmap);
			var lineseg = L.polyline([[schools[i].lat, schools[i].lon], 
				[nc_centers.lat_ctr[cluster_id-1], nc_centers.lon_ctr[cluster_id-1]]],
				{ weight: 1+((schools[i].count<10)?0:Math.sqrt(schools[i].count)) });
			lineseg.addTo(neighmap);
		} // TODO: log that we've got a school iwth no location!
	}
}
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: displaySchools
    });
}
var geojson;
$.getJSON('clusters.geojson', function(data){
    geojson = L.geoJson(data, {style: style, onEachFeature: onEachFeature}).addTo(neighmap);
});

