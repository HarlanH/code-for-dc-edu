// set up global variables (uh oh) here
var map,
    $select = $('#schoolsList');

$(function () {
    map = new Map('map');
});

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
