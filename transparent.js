// 997 was what we were using before. 53124 is a nice B&W
var tileString = 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/53124/256/{z}/{x}/{y}.png';

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
          cluster.lat = data.latitude[key];
          cluster.lon = data.longitude[key];
          cluster.ward = data.ward[key];
          clusters[cluster.id] = cluster;
        }
      });
    }
  });
 
  return clusters;
}
function getSchools(clusterId) {
  var schools = [];
  $.ajax({
    dataType: "json",
    url: "data/commute_data_denorm.json",
    data: {},
    async: false,
    success: function(data)
    {
      var school = {};
      
      $.each(data.cluster, function(key, val) {
        if(val == clusterId)
        {
          school = {};
          
          school.school_name = data.school_name[key];
          school.count = data.count[key];
          school.lat = data.latitude[key];
          school.lon = data.longitude[key];
          school.charter = data.charter_status[key];
          school.school_type = data.school_type[key];
          
          school.elementary_tag = (data.prek_3[key]||data.prek_4[key]||data.preschool[key]||data.kindergarten[key]
                                   ||data.grade_1[key]||data.grade_2[key]
                                   ||data.grade_3[key]||data.grade_4[key]||data.grade_5[key]);
          school.middle_tag = (data.grade_6[key]||data.grade_7[key]||data.grade_8[key]);
          school.high_tag = (data.grade_9[key]||data.grade_10[key]||data.grade_11[key]||data.grade_12[key]);
          
          if(!(school.elementary_tag||school.middle_tag||school.high_tag)){
              console.log( school.school_name+ " " +
                           data.kindergarten[key] + " " + data.grade_1[key] + " " + data.grade_2[key] + " "+
                           data.grade_3[key] + " " + data.grade_4[key] + " " + data.grade_5[key] + " "+
                           data.grade_6[key] + " " + data.grade_7[key] + " " + data.grade_8[key] + " "+
                           data.grade_9[key] + " " + data.grade_10[key] + " " + data.grade_11[key] + " "+data.grade_12[key] 
                  );
//           }else{
//               console.log( school.school_name+ " " +
//                            school.elementary_tag+ " " +school.middle_tag+ " " +school.high_tag);
          }

          schools.push(school);
        }
      });
    }
  });
 
  return schools;
}


var nc_centers;
$.getJSON('data/nc_names_centers.json', function(data) {
  nc_centers = data;
})

function style(feature) {
    return {
        fillColor: '#3875A3',
        weight: 2,
        opacity: .7,
        color: '#12446A',
        //dashArray: '3',
        fillOpacity: 0.5
    };
}

var grades = [0, 10, 20, 50, 80, 120, 150];

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
    return d<2   ? 0.4 : 
        d<100 ? 0.4 + (d/100.0)*0.5 : 
         0.9 ;
}

function highlightLine(e) {
  // TODO: might be fun to add an icon at the end of the line while the line's highlighted?
  var layer = e.target;

    layer.setStyle({
        opacity: 1,
        weight: layer.options.weight + 3
        //color: 'darkblue'
    });
    if (infobox) {
      infobox._div.innerHTML = e.target.options.txt;
    }
}
function resetLine(e) {
  var layer = e.target;

    layer.setStyle({
        opacity: layer.options.orig_opacity,
        weight: layer.options.orig_weight
        //color: layer.options.orig_color
    });
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
    infobox.update(layer.feature.properties);
}
function resetNC(e) {
    geojson.resetStyle(e.target);
    infobox.update();
}
