var map;

$(function () {
    map = new Map('neighmap');
});

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
    updateFilters();
});

function updateFilters() {
    delete globalFilter.charter_status;
    delete globalFilter.levels;
    if (button_onoff.charter !== button_onoff["public"]) {
        globalFilter.charter_status = (button_onoff.charter === 1) ? true : false;
    }
    if (!(button_onoff.elementary === button_onoff.middle && button_onoff.middle === button_onoff.high)) {
        globalFilter.levels = [];
        if (button_onoff.elementary === 1) { globalFilter.levels.push("elementary"); }
        if (button_onoff.middle === 1) { globalFilter.levels.push("middle"); }
        if (button_onoff.high === 1) { globalFilter.levels.push("high"); }
    }
    if (_.has(globalFilter, "cluster") || _.has(globalFilter, "school_code")) {
        map.displayEdges(globalFilter);
    }
}