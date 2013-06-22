// set up global variables (uh oh) here
var map = L.map('map').setView([38.895111, -77.036667], 11);
var $select = $('#schoolsList');
var schoolmarker = new Array(); 
var geojson;
var school_lines = new Array(); 
var infobox = L.control();
var legend = L.control({position: 'bottomleft'});


// the document's ready, so we can do stuff to it
$(document).ready(function() {
	L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
	    maxZoom: 18,
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
	}).addTo(map);

	//request the JSON data and parse into the select element
	$.getJSON('data/schools.json', function(data){
	 
	  //clear the current content of the select
	  $select.html('');
	 
	  //iterate over the data and append a select option
	  $.each(data, function(key, val){
	    $select.append('<option id="' + val.school_code + '">' + val.schoolname + '</option>');
	  })
	});

	$.getJSON('clusters.geojson', function(data){
	    geojson = L.geoJson(data, {style: style, onEachFeature: onEachFeature}).addTo(map);
	});
	
	infobox.onAdd = function (map) {
	    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
	    this.update();
	    return this._div;
	};

	// method that we will use to update the control based on feature properties passed
	infobox.update = function (props) {
	    this._div.innerHTML = props ? props.NBH_NAMES : "Hover over to learn more";
	};

	infobox.addTo(map);

	legend.onAdd = function (map) {
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
	legend.addTo(map);
});

// function defs below

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightNC,
        mouseout: resetNC
        //click: displaySchools
    });
}


function schoolListSelected() {
	var myselect = document.getElementById("schoolsList");
	var schoolID = myselect.options[myselect.selectedIndex].id;
	var school_name = myselect.options[myselect.selectedIndex].value;
	var clusters = getClusters(schoolID);
	// clusters[1].lat and .lon should work
	//console.log(clusters);

	// wipe any old school lines
	while (school_lines.length > 0) {
            map.removeLayer(school_lines.pop());
	}

	// change the colors of the NCs

	// draw lines between the school and the NC centers
	// iterate, plot the points and lines
	for (i = 0; i < clusters.length; i++) {
		if (i in clusters && typeof clusters[i].lat === 'number') { // if the _school_ has a location
			var cluster_id = clusters[i].id
			var lineseg = L.polyline([[clusters[i].lat, clusters[i].lon], 
									  [nc_centers.lat_ctr[cluster_id-1], nc_centers.lon_ctr[cluster_id-1]]],
				{
					weight: 3+((clusters[i].count<10)?0:Math.sqrt(clusters[i].count/4.0)),
					orig_weight: 3+((clusters[i].count<10)?0:Math.sqrt(clusters[i].count/4.0)),
				  	opacity: line_opacity(clusters[i].count),
				  	orig_opacity: line_opacity(clusters[i].count),
                    color: getColor(clusters[i].count),
                    orig_color: getColor(clusters[i].count),
				 	txt: nc_centers.names[cluster_id-1] + " -> " + school_name + ": " + ((clusters[i].count<10)?"few":clusters[i].count) + " students" 
				});

			lineseg.addTo(map);

			lineseg.on({ mouseover: highlightLine, mouseout: resetLine });

			school_lines.push(lineseg);

			//lineseg.bindPopup(schools[i].school_name + ": " + ((schools[i].count<10)?"few":schools[i].count) + " students")
		} // TODO: log that we've got a school iwth no location!
	}

	// drop a pushpin on the school

	// var first_cluster = clusters[Object.keys(clusters)[0]];

	// if(schoolmarker.length > 0){
	// 	map.removeLayer(nclayer);
	// }
	// for(i=0;i<schoolmarker.length;i++) {
	// 	map.removeLayer(schoolmarker[i]);
	// 	schoolmarker.splice(i,1);
	// }  
	// displayClusters(schoolID);
	// //console.log(first_cluster);
	// var TempMarker = new L.marker([first_cluster.lat, first_cluster.lon]);
	// schoolmarker.push(TempMarker);
	// //schoolmarker[0].bindPopup(schoolID);
	// map.addLayer(schoolmarker[0]);
}
