
function getClusters(schoolCode)
{
  var clusters = [];

  $.ajax({
    dataType: "json",
    url: "data/commute_data_denorm.json",
    data: {},
    async: false,
    success: function(data)
    {
      var code = schoolCode;
      var cluster = {};

      cluster.school_code = code;

      $.each(data.school_code, function(key, val) {
        if(val == code)
        {
          cluster = {};
          
          cluster.id = data.cluster[key];
          cluster.count = data.count[key];
          cluster.lat = data.lat[key];
          cluster.lon = data.lon[key];
          clusters[cluster.id] = cluster;
        }
      });
    }
  });
 
  return clusters;
}

var schoolmarker = new Array(); 
var geojson;
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
            style: function (feature) {
                var clusters = [];

                clusters = getClusters(schoolId);
                var id = parseInt(feature.properties.GIS_ID.substring(8));

                if(id in clusters  )
                {
                    if(clusters[id].count >0)
                    {
                        return {color: 'blue'};
                    }
                    else
                    {
                        return {color:'red'}
                    }

                }
                else
                {
                    return {color:'red'}
                }
            }      
        }).addTo(map);

        console.log(geojson);

    });
}
