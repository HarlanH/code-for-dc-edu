// set up global variables (uh oh) here
var neighmap = L.map('neighmap').setView([38.895111, -77.036667], 11);
var info = L.control();
var grades = [0, 10, 20, 50, 80, 120, 150];
var school_lines = new Array(); 
var geojson;
var legend = L.control({position: 'bottomleft'});

// the document's ready, so we can do stuff to it
$(document).ready(function() {
	L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
	    maxZoom: 18,
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
	}).addTo(neighmap);

	// draw neighborhood boundaries on neighborhood map and attach event listeners
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

	$.getJSON('clusters.geojson', function(data){
	    geojson = L.geoJson(data, {style: style, onEachFeature: onEachFeature}).addTo(neighmap);
	});


	// http://leafletjs.com/examples/choropleth.html
	legend.onAdd = function (neighmap) {
	    var div = L.DomUtil.create('div', 'info legend'),
	    labels = [];
	    // loop through our density intervals and generate a label with a colored square for each interval
	    for (var i = 0; i < grades.length; i++) {
	        div.innerHTML +=
	            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
	            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
	    }
	    return div;
	};


});

// function defs below



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
function highlightNC(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        opacity: 1
        //color: '#666',
        //dashArray: '',
        //fillOpacity: 0.7
    });
    info.update(layer.feature.properties);
}
function resetNC(e) {
    geojson.resetStyle(e.target);
    info.update();
}
function highlightLine(e) {
	var layer = e.target;

    layer.setStyle({
        opacity: 1,
        color: 'red'
    });
    info._div.innerHTML = e.target.options.txt;
}
function resetLine(e) {
	var layer = e.target;

    layer.setStyle({
        opacity: .5,
        color: 'blue'
    });
}
function getColor(d) {
    return d > grades[6] ? '#800026':
           d > grades[5] ? '#BD0026':
           d > grades[4] ? '#E31A1C':
           d > grades[3] ? '#FC4E2A':
           d > grades[2] ? '#FD8D3C':
           d > grades[1] ? '#FEB24C':
                           '#FFEDA0';
}
//           d > grades[1] ? '#FED976':
function getColorR(d) {
    return d > grades[6] ? '#FFEDA0':
           d > grades[5] ? '#FEB24C':
           d > grades[4] ? '#FD8D3C':
           d > grades[3] ? '#FC4E2A':
           d > grades[2] ? '#E31A1C':
           d > grades[1] ? '#BD0026':
                           '#800026';
//           d > grades[6] ? '#FED976':
}
function line_opacity(d){
    return d<2   ? 0.3 : 
        d<100 ? 0.3 + (d/100.0)*0.4 : 
         0.7 ;
}

function displaySchools(e) {
	var layer = e.target;

	if (school_lines.length > 0) {
            legend.removeFrom(neighmap);
        }
        legend.addTo(neighmap);
	// wipe any old school lines
	while (school_lines.length > 0) {
            neighmap.removeLayer(school_lines.pop());
	}
	// get the schools for this cluster
	var cluster_id = parseInt(layer.feature.properties.GIS_ID.substring(8));
	console.log(cluster_id);
	var schools = getSchools(cluster_id);
	console.log(schools);
	// iterate, plot the points and lines
	for (i = 0; i < schools.length; i++) {
		if (typeof schools[i].lat === 'number') {
			//var marker = L.circleMarker([schools[i].lat, schools[i].lon], {radius: 5+((schools[i].count<10)?0:Math.sqrt(schools[i].count))});
			//marker.addTo(neighmap);
			var lineseg = L.polyline([[schools[i].lat, schools[i].lon], 
				[nc_centers.lat_ctr[cluster_id-1], nc_centers.lon_ctr[cluster_id-1]]],
				{ weight: 3+((schools[i].count<10)?0:Math.sqrt(schools[i].count/4.0)),
				  opacity: line_opacity(schools[i].count), 
                                  color: getColor(schools[i].count),
				  txt: schools[i].school_name + ": " + ((schools[i].count<10)?"few":schools[i].count) + " students" });
			lineseg.addTo(neighmap);
			lineseg.on({mouseover: highlightLine, mouseout: resetLine});
			school_lines.push(lineseg);
			//lineseg.bindPopup(schools[i].school_name + ": " + ((schools[i].count<10)?"few":schools[i].count) + " students")
		} // TODO: log that we've got a school iwth no location!
	}
}
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightNC,
        mouseout: resetNC,
        click: displaySchools
    });
}


