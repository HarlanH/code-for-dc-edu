var map;

$(function () {
    map = new Map('neighmap');
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
