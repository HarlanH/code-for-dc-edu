// set up global variables (uh oh) here
var map = L.map('map', {minZoom:11, maxZoom:14}).setView([38.895111, -77.036667], 12);
var $select = $('#schoolsList');
var schoolmarker = new Array(); 
var geojson;
var school_lines = new Array(); 
var infobox = L.control();
var legend = L.control({position: 'bottomleft'});


// the active attribute doesn't change until after onclick is resolved so it's easier to manually track button state 
var button_onoff = {
    "charter":1,
    "public":1,
    "elementary":1,
    "middle":1,
    "high":1,
    "allwards":1,
    "w1":0,
    "w2":0,
    "w3":0,
    "w4":0,
    "w5":0,
    "w7":0,
    "w8":0
};
$('.btn-group').on('click', 'button', function(e){     
        var selected = $(this).attr('value');
//         console.log(selected);
        if($(this).hasClass("active")){
        	button_onoff[selected] = 0; 
            $(this).removeClass("btn-primary");
            //$(this).addClass("btn-inverse"); 
//               console.log("deactivating "+selected);
        }else{
            button_onoff[selected] = 1; 
            $(this).addClass("btn-primary");
            //$(this).removeClass("btn-inverse");
//              console.log("activating "+selected);
        }
        dropdownmenu();
    });
$('.btn-group2').on('click', 'button', function(e){     
        var selected = $(this).attr('value');
//         console.log(selected);
        button_onoff["allwards"]=0;
        button_onoff["w1"]=0;
        button_onoff["w2"]=0;
        button_onoff["w3"]=0;
        button_onoff["w4"]=0;
        button_onoff["w5"]=0;
        button_onoff["w6"]=0;
        button_onoff["w7"]=0;
        button_onoff["w8"]=0;
        button_onoff[selected] = 1; 
        dropdownmenu();
    });

function dropdownmenu() {
    //clear the current content of the select
    $select.html('');
    // add instructions
    $select.append('<option>Pick a School</option>');

	//request the JSON data and parse into the select element
          //var schools = getAllSchools(); 
	$.getJSON('data/schools.json', function(data){
		log(button_onoff);
	  //iterate over the data and append a select option
	  $.each(data, function(key, val){
	  	if ((val.charter_status && button_onoff["charter"]) ||
	  		(!val.charter_status && button_onoff["public"])) {
	  		if ((val.elementary && button_onoff["elementary"]) ||
	  			(val.middle && button_onoff["middle"]) ||
	  			(val.high && button_onoff["high"])) {
	  			if (button_onoff["allwards"] ||
	  				(val.ward == 1 && button_onoff["w1"]) ||
	  				(val.ward == 2 && button_onoff["w2"]) ||
	  				(val.ward == 3 && button_onoff["w3"]) ||
	  				(val.ward == 4 && button_onoff["w4"]) ||
	  				(val.ward == 5 && button_onoff["w5"]) ||
	  				(val.ward == 6 && button_onoff["w6"]) ||
	  				(val.ward == 7 && button_onoff["w7"]) ||
	  				(val.ward == 8 && button_onoff["w8"])) {
	  				$select.append('<option id="' + val.school_code + '">' + val.school_name + '</option>');
	  			}
	  		}
	  	}
	  });

	  updateIfHashedLink();
	});
}

function updateIfHashedLink() {
	if (window.location.hash) {
		var id = window.location.hash.split('#')[1],
		menu = document.getElementById("schoolsList");
		for (var i = 0; i < menu.options.length; i++) {
			if (menu.options[i].id == id) {
				menu.selectedIndex = i;
				menu.onchange();
			}
		}
	}
}

// the document's ready, so we can do stuff to it
$(document).ready(function() {
	L.tileLayer(tileString, {
	    maxZoom: 18,
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
	}).addTo(map);
        
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
        
    dropdownmenu();
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
	log(clusters);

	// wipe any old school lines
	while (school_lines.length > 0) {
            map.removeLayer(school_lines.pop());
	}
        

	// change the colors of the NCs
	// draw lines between the school and the NC centers
	// iterate, plot the points and lines
	for (i = 0; i < clusters.length; i++) {
            // if the _school_ has a location
		if (i in clusters && typeof clusters[i].lat === 'number'){ 
			var cluster_id = clusters[i].id
			var lineseg = L.polyline([[clusters[i].lat, clusters[i].lon], 
									  [nc_centers.lat_ctr[cluster_id-1], nc_centers.lon_ctr[cluster_id-1]]],
				{
					id: cluster_id,
					weight: 3+((clusters[i].count<10)?0:Math.sqrt(clusters[i].count/4.0)),
					orig_weight: 3+((clusters[i].count<10)?0:Math.sqrt(clusters[i].count/4.0)),
				  	opacity: line_opacity(clusters[i].count),
				  	orig_opacity: line_opacity(clusters[i].count),
                    color: getColor(clusters[i].count),
                    orig_color: getColor(clusters[i].count),
				 	txt: nc_centers.names[cluster_id-1] + " -> " + school_name + ": " + ((clusters[i].count<10)?"few":clusters[i].count) + " students" 
				});

			lineseg.addTo(map);

			lineseg.on({ mouseover: highlightLine, mouseout: resetLine, click: clickLine });

			school_lines.push(lineseg);

			//lineseg.bindPopup(schools[i].school_name + ": " + ((schools[i].count<10)?"few":schools[i].count) + " students")
		} else {
			// log that we've got a school iwth no location! (common -- skip for now)
			//log("error:", i, clusters[i]);
		}
	}

	function clickLine(e) {
		var url = "/neighborhood.html#" + e.target.options.id;
		window.location.href = url;
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
