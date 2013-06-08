$(document).ready(function() {
// Handler for .ready() called.

});

var map = L.map('map').setView([38.895111, -77.036667], 11);

L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
}).addTo(map);

var $select = $('#schoolsList');
//request the JSON data and parse into the select element
$.getJSON('data/schools.json', function(data){
 
  //clear the current content of the select
  $select.html('');
 
  //iterate over the data and append a select option
  $.each(data, function(key, val){
    $select.append('<option id="' + val.school_code + '">' + val.schoolname + '</option>');
  })
});
