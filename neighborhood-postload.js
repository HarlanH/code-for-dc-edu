// set up global variables (uh oh) here
var neighmap = L.map('neighmap', {minZoom:11, maxZoom:14}).setView([38.895111, -77.036667], 12);
var infobox = L.control();
var school_lines = new Array(); 
var geojson;
var legend = L.control({position: 'bottomleft'});

// the document's ready, so we can do stuff to it
$(document).ready(function() {
	L.tileLayer(tileString, {
	    maxZoom: 18,
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
	}).addTo(neighmap);

	// draw neighborhood boundaries on neighborhood map and attach event listeners
	infobox.onAdd = function (map) {
	    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
	    this.update();
	    return this._div;
	};

	// method that we will use to update the control based on feature properties passed
	infobox.update = function (props) {
	    this._div.innerHTML = props ? props.NBH_NAMES : "Hover over or Click to learn more";
	};

	infobox.addTo(neighmap);

	$.getJSON('clusters.geojson', function(data){
	    geojson = L.geoJson(data, {style: style, onEachFeature: onEachFeature}).addTo(neighmap);
		updateIfHashedLink();
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

function updateIfHashedLink() {
	if (window.location.hash) {
		var id = window.location.hash.split('#')[1],
		gisified = "00000000" + id,
		evt = {target:{feature:{properties:{GIS_ID:gisified}}}};
		displaySchools(evt);
	}
}

// the active attribute doesn't change until after onclick is resolved so it's easier to manually track button state 
var button_onoff = {
    "charter":1,
    "public":1,
    "elementary":1,
    "middle":1,
    "high":1,
};
$('.btn-group').on('click', 'button', function(e){     
        var selected = $(this).attr('value');
//         console.log(selected);
        if($(this).hasClass("active")){
            button_onoff[selected] = 0; 
            $(this).removeClass("btn-primary");
            //$(this).addClass("btn-inverse"); 
//              console.log("deactivating "+selected);
        }else{
            button_onoff[selected] = 1; 
            //$(this).removeClass("btn-inverse");
            $(this).addClass("btn-primary");
//             console.log("activating "+selected);
        }
        displaySchools('none',$(this));
    });

var first_pass = 1;
var layer ;
function displaySchools(e,toggleswitch) {
    if(e == 'none'){
        // this happens if the click comes from buttons
        if(first_pass == 1){
            //if buttons activate this script for the first time there is 
            // no school layer to modify yet -- return;
            return; 
        }
    }else{
        toggleswitch = 'none'
	layer = e.target;
    }
//     console.log(" button checks: "+ button_onoff["charter"]+" "+button_onoff["public"]+
//                 " "+button_onoff["elementary"] +" "+ button_onoff["middle"] +" "+ button_onoff["high"]);

    // sometimes there will be no lines but a legend because of the filters so first pass is used.
    if (first_pass != 1) {
        legend.removeFrom(neighmap);
    }
    legend.addTo(neighmap); first_pass = 0;
	// wipe any old school lines
	while (school_lines.length > 0) {
            neighmap.removeLayer(school_lines.pop());
	}
	// get the schools for this cluster
	var cluster_id = parseInt(layer.feature.properties.GIS_ID.substring(8));
	//console.log(cluster_id);
	var schools = getSchools(cluster_id);
	//log(schools);
	// iterate, plot the points and lines
	for (i = 0; i < schools.length; i++) {
		if (typeof schools[i].lat != 'number') {
			continue;
		}
		// show the school if either: the public button is on and it's public, or the 
		// charter button is on and it's a charter
		// AND
		// either the elementary button is on and it's an elementary, etc.
		var show_school_type = (button_onoff["public"] && !schools[i].charter) ||
			(button_onoff["charter"] && schools[i].charter);
		var show_school_grade = (button_onoff["elementary"] && schools[i].elementary_tag) ||
			(button_onoff["middle"] && schools[i].middle_tag) ||
			(button_onoff["high"] && schools[i].high_tag)
		if (show_school_type && show_school_grade) {
			//var marker = L.circleMarker([schools[i].lat, schools[i].lon], {radius: 5+((schools[i].count<10)?0:Math.sqrt(schools[i].count))});
			//marker.addTo(neighmap);
			var lineseg = L.polyline([[schools[i].lat, schools[i].lon], 
									  [nc_centers.lat_ctr[cluster_id-1], nc_centers.lon_ctr[cluster_id-1]]],
				{
					id: schools[i].school_code,
					weight: 3+((schools[i].count<10)?0:Math.sqrt(schools[i].count/4.0)),
					orig_weight: 3+((schools[i].count<10)?0:Math.sqrt(schools[i].count/4.0)),
				  	opacity: line_opacity(schools[i].count),
				  	orig_opacity: line_opacity(schools[i].count),
                    color: getColor(schools[i].count),
                    orig_color: getColor(schools[i].count),
				 	txt: nc_centers.names[cluster_id-1] + " -> " + schools[i].school_name + ": " + ((schools[i].count<10)?"few":schools[i].count) + " students" 
				});

			lineseg.addTo(neighmap);

			lineseg.on({ mouseover: highlightLine, mouseout: resetLine, click: clickLine });

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

function clickLine(e) {
	var url = "/school.html#" + e.target.options.id;
	window.location.href = url;
}
