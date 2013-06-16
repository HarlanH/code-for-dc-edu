
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
          school.lat = data.lat[key];
          school.lon = data.lon[key];
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
