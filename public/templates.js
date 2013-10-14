/*jslint browser: true*/
/*jslint nomen: true*/
/*global $, _, map, data, globalFilter*/

var templates;

(function () {
    "use strict";

    var updateFilters = function (e) {
            var group = e.delegateTarget.id,
                value = e.target.value;

            switch (group) {
            case "systembuttons":
                $(e.target).toggleClass("btn-primary");
                if ($("#systembuttons .btn-primary").length === 1) {
                    globalFilter.charter_status = (value === "charter") ? false : true;
                } else {
                    delete globalFilter.charter_status;
                    $("#systembuttons button").addClass("btn-primary active");
                    $(e.target).toggleClass("active");
                }
                break;
            case "levelsbuttons":
                $(e.target).toggleClass("btn-primary");
                if (!globalFilter.levels) { globalFilter.levels = ["elementary", "middle", "high"]; }
                if (_.contains(globalFilter.levels, value)) {
                    _.pull(globalFilter.levels, value);
                } else {
                    globalFilter.levels.push(value);
                }
                if (globalFilter.levels.length === 0) {
                    delete globalFilter.levels;
                    $("#levelsbuttons button").addClass("btn-primary active");
                    $(e.target).toggleClass("active");
                }
                break;
            case "wardsbuttons":
                if (value === "allwards") {
                    delete globalFilter.ward;
                } else {
                    globalFilter.ward = parseInt(value.charAt(1), 10);
                }
                break;
            }
        },
        updateButtonStatus = function () {
            if (globalFilter.charter_status) {
                if (globalFilter.charter_status === true) {
                    $("#dcps").removeClass("btn-primary active");
                } else {
                    $("#charter").removeClass("btn-primary active");
                }
            }
            if (globalFilter.levels) {
                _.forEach(_.difference(["elementary", "middle", "high"], globalFilter.levels), function (id) {
                    $("#" + id).removeClass("btn-primary active");
                });
            }
        };

    templates = {
        home: {
            t: "", // Modify default content in index.html
            init: function () {
                map.animate();
            },
            strike: function () {
                map.stopAnimation();
            }
        },
        school: {
            t: ["<b>Select a school from the dropdown menu to see where its students commute from.</b>",
                "<div><b>Choose which schools are available through the dropdown menu using the buttons.</b></div>",
                "<p>",
                    "<div id='systembuttons' class='btn-group' data-toggle='buttons-checkbox'>",
                        "<button value='charter' id='charter' type='button' class='btn btn-primary active'>Charter</button>",
                        "<button value='dcps' id='dcps' type='button' class='btn btn-primary active'>DCPS</button>",
                    "</div>",
                    "<div id='levelsbuttons' class='btn-group' data-toggle='buttons-checkbox'>",
                        "<button value='elementary' id='elementary' type='button' class='btn btn-primary active'>Elementary</button>",
                        "<button value='middle' id='middle' type='button' class='btn btn-primary active'>Middle</button>",
                        "<button value='high' id='high' type='button' class='btn btn-primary active'>High</button>",
                    "</div>",
                "</p>",
                "<p>",
                    "<div id='wardsbuttons' class='btn-group' data-toggle='buttons-radio'>",
                        "<button name='ward' value='allwards' id='allwards' type='button' class='btn active'> All Wards</button>",
                        "<button name='ward' value='w1' id='w1' type='button' class='btn'> 1</button>",
                        "<button name='ward' value='w2' id='w2' type='button' class='btn'> 2</button>",
                        "<button name='ward' value='w3' id='w3' type='button' class='btn'> 3</button>",
                        "<button name='ward' value='w4' id='w4' type='button' class='btn'> 4</button>",
                        "<button name='ward' value='w5' id='w5' type='button' class='btn'> 5</button>",
                        "<button name='ward' value='w6' id='w6' type='button' class='btn'> 6</button>",
                        "<button name='ward' value='w7' id='w7' type='button' class='btn'> 7</button>",
                        "<button name='ward' value='w8' id='w8' type='button' class='btn'> 8</button>",
                    "</div>",
                "</p>",
                "<select id='schoolsList' name='schoolsList'></select>"].join("\n"),
            init: function () {
                updateButtonStatus();
                $(".btn-group").on("click.school", "button", function (e) { updateFilters(e); templates.school.update(); });
                $('#schoolsList').on("change.school", function () {
                    window.location.hash = "#!/school/" + parseInt($('#schoolsList').find(":selected").attr("id"), 10);
                });
                templates.school.update();
            },
            update: function () {
                var $select = $('#schoolsList');
                $select.html('');
                $select.append('<option>Pick a School</option>');
                _(data.schools(_.omit(globalFilter, "school_code"))).forEach(function (school) {
                    $select.append('<option id="' + school.school_code + '">' + school.school_name + '</option>');
                    if (school.school_code === globalFilter.school_code) {
                        $("#schoolsList option[id='" + globalFilter.school_code + "']").prop('selected', true);
                    }
                });
            },
            strike: function () {
                $(".btn-group").off(".school");
                map.edges.clearLayers();
                delete globalFilter.school_code;
                delete globalFilter.ward;
            }
        },
        neighborhood: {
            t: ["<b>Click a neighborhood to see where its students attend school.</b>",
                "<div><b>Use the buttons to hide various school types.</b></div>",
                "<p>",
                    "<div id='systembuttons' class='btn-group' data-toggle='buttons-checkbox'>",
                        "<button value='charter' id='charter' type='button' class='btn btn-primary active'>Charter</button>",
                        "<button value='dcps' id='dcps' type='button' class='btn btn-primary active'>DCPS</button>",
                    "</div>",
                    "<div id='levelsbuttons' class='btn-group' data-toggle='buttons-checkbox'>",
                        "<button value='elementary' id='elementary' type='button' class='btn btn-primary active'>Elementary</button>",
                        "<button value='middle' id='middle' type='button' class='btn btn-primary active'>Middle</button>",
                        "<button value='high' id='high' type='button' class='btn btn-primary active'>High</button>",
                    "</div>",
                "</p>"].join("\n"),
            init: function () {
                updateButtonStatus();
                $(".btn-group").on("click.neighborhood", "button", function (e) { updateFilters(e); templates.neighborhood.update(); });
            },
            update: function () {
                if (globalFilter.cluster) { map.displayEdges(globalFilter); }
            },
            strike: function () {
                $(".btn-group").off(".neighborhood");
                map.edges.clearLayers();
                delete globalFilter.cluster;
            }
        }
    };
}());