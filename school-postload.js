// set up global variables (uh oh) here
var map = L.map('map').setView([38.895111, -77.036667], 11);
var $select = $('#schoolsList');
var schoolmarker = new Array(); 
var geojson;

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

});

// function defs below


function schoolListSelected() {
  var myselect = document.getElementById("schoolsList");
  var schoolID = myselect.options[myselect.selectedIndex].id;
  var clusters = getClusters(schoolID);
  // clusters[1].lat and .lon should work
  //console.log(clusters);
  var first_cluster = clusters[Object.keys(clusters)[0]];

  if(schoolmarker.length > 0){
      map.removeLayer(geojson);
  }
  for(i=0;i<schoolmarker.length;i++) {
      map.removeLayer(schoolmarker[i]);
      schoolmarker.splice(i,1);
  }  
   displayClusters(schoolID);
   //console.log(first_cluster);
   var TempMarker = new L.marker([first_cluster.lat, first_cluster.lon]);
   schoolmarker.push(TempMarker);
   //schoolmarker[0].bindPopup(schoolID);
   map.addLayer(schoolmarker[0]);
}

function displayClusters(schoolId)
{
    $.getJSON('clusters.geojson', function(data){
    geojson = L.geoJson(data, {
            style: function(feature) {
            	var clusters = [];

			    clusters = getClusters(schoolId);
			    var id = parseInt(feature.properties.GIS_ID.substring(8));
			    var opacity = .2;
			    if(id in clusters )
			    {
			        if(clusters[id].count >0)
			        {
			            opacity = Math.max(.2,clusters[id].count / 100);
			        }
			    }
			    return {
			        fillColor: 'grey',
			        weight: 2,
			        opacity: .8,
			        color: 'white',
			        //dashArray: '3',
			        fillOpacity: opacity
			    };
            }     
        }).addTo(map);

        console.log(geojson);

    });
}
