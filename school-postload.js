// set up global variables (uh oh) here
var map,
    $select = $('#schoolsList');

$(function () {
    map = new Map('map', true);

    dropdownmenu();
    $select.on('change', function (e) {
        globalFilter.school_code = parseInt($select.find(":selected").attr("id"), 10);
        map.displayEdges(globalFilter);
    });
    if (globalFilter.school_code) {
        $("#schoolsList option[id='" + globalFilter.school_code + "']").prop('selected', true);
    }
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
        updateFilters();
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
        updateFilters();
    });

function updateFilters() {
    delete globalFilter.charter_status;
    delete globalFilter.levels;
    delete globalFilter.ward;
    if (button_onoff.charter !== button_onoff["public"]) {
        globalFilter.charter_status = (button_onoff.charter === 1) ? true : false;
    }
    if (!(button_onoff.elementary === button_onoff.middle && button_onoff.middle === button_onoff.high)) {
        globalFilter.levels = [];
        if (button_onoff.elementary === 1) { globalFilter.levels.push("elementary"); }
        if (button_onoff.middle === 1) { globalFilter.levels.push("middle"); }
        if (button_onoff.high === 1) { globalFilter.levels.push("high"); }
    }
    if (button_onoff.allwards === 0) {
        globalFilter.ward = parseInt(_(button_onoff).pick(function (v, k) { return (k.charAt(0) === "w") && (v === 1); }).keys().value()[0].charAt(1),10);
    }
    dropdownmenu();
}

function dropdownmenu() {
    //clear the current content of the select
    $select.html('');
    // add instructions
    $select.append('<option>Pick a School</option>');

    _(data.schools(_.omit(globalFilter, "school_code"))).forEach(function (school) {
        $select.append('<option id="' + school.school_code + '">' + school.school_name + '</option>');
    });
}