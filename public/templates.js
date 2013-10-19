/*jslint browser: true*/
/*jslint nomen: true*/
/*global $, _, map, data, utils, globalFilter*/

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
                    "<div id='systembuttons' class='btn-group filters' data-toggle='buttons-checkbox'>",
                        "<button value='charter' id='charter' type='button' class='btn btn-primary active'>Charter</button>",
                        "<button value='dcps' id='dcps' type='button' class='btn btn-primary active'>DCPS</button>",
                    "</div>",
                    "<div id='levelsbuttons' class='btn-group filters' data-toggle='buttons-checkbox'>",
                        "<button value='elementary' id='elementary' type='button' class='btn btn-primary active'>Elementary</button>",
                        "<button value='middle' id='middle' type='button' class='btn btn-primary active'>Middle</button>",
                        "<button value='high' id='high' type='button' class='btn btn-primary active'>High</button>",
                    "</div>",
                "</p>",
                "<p>",
                    "<div id='wardsbuttons' class='btn-group filters' data-toggle='buttons-radio'>",
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
                "<select id='schoolsList' name='schoolsList'></select>",
                "<div id='school-info'></div>",
                "<div id='map-views-toggle' style='display: none; margin-top: 20px;'>",
                    "<h4>View map data on&hellip;</h4>",
                    "<ul class='nav nav-pills nav-stacked'>",
                        "<li id='map-views-commutes' class='active'><a>Where this schools' students live</a></li>",
                        "<li id='map-views-zones' class='disabled'><a>What areas are zoned for this school</a></li>",
                    "</ul>",
                "</div>"].join("\n"),
            schoolInfo: _.template([
                "<h1><%= school.school_name %></h1>",
                "<p><%= school.school_address %></p>",
                "<p>",
                "<a href='http://www.learndc.org/schoolprofiles/view#<%= utils.zeroPad(school.school_code, 4) %>/overview' target='_blank'>",
                "Explore information about <%= school.school_name %> on LearnDC",
                "</a>",
                "</p>"
            ].join("\n"), null, { 'variable': 'school' }),
            init: function () {
                updateButtonStatus();
                $(".filters").on("click.school", "button", function (e) { updateFilters(e); templates.school.update(); });
                $("#map-views-commutes").on("click.school", "a", function (e) {
                    if (!$(e.delegateTarget).hasClass("disabled")) {
                        $(e.delegateTarget).addClass("active");
                        $("#map-views-zones").removeClass("active");
                        map.boundaries.clearLayers();
                        map.displayEdges(globalFilter);
                    }
                });
                $("#map-views-zones").on("click.school", "a", function (e) {
                    if (!$(e.delegateTarget).hasClass("disabled")) {
                        $(e.delegateTarget).addClass("active");
                        $("#map-views-commutes").removeClass("active");
                        map.edges.clearLayers();
                        map.displayBoundary(globalFilter.school_code);
                    }
                });
                $('#schoolsList').on("change.school", function () {
                    window.location.hash = "#!/school/" + parseInt($('#schoolsList').find(":selected").attr("id"), 10);
                });
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
                if (globalFilter.school_code) {
                    var boundary = data.boundary(globalFilter.school_code);
                    $("#school-info").html(this.schoolInfo(data.schools({ "school_code": globalFilter.school_code })[0]));
                    $("#map-views-toggle").show();
                    if (boundary.length > 0) {
                        $("#map-views-zones").removeClass("disabled");
                    } else {
                        $("#map-views-zones").addClass("disabled");
                        $("#map-views-zones").removeClass("active");
                        $("#map-views-commutes").addClass("active");
                        map.boundaries.clearLayers();
                    }
                    if ($("#map-views-zones").hasClass("active")) {
                        map.displayBoundary(globalFilter.school_code);
                    } else {
                        map.displayEdges({ "school_code": globalFilter.school_code });
                    }
                } else {
                    $("#map-views-toggle").hide();
                }
            },
            strike: function () {
                $(".filters").off(".school");
                map.edges.clearLayers();
                map.boundaries.clearLayers();
                delete globalFilter.school_code;
                delete globalFilter.ward;
            }
        },
        neighborhood: {
            t: ["<b>Click a neighborhood to see where its students attend school.</b>",
                "<div><b>Use the buttons to hide various school types.</b></div>",
                "<p>",
                    "<div id='systembuttons' class='btn-group filters' data-toggle='buttons-checkbox'>",
                        "<button value='charter' id='charter' type='button' class='btn btn-primary active'>Charter</button>",
                        "<button value='dcps' id='dcps' type='button' class='btn btn-primary active'>DCPS</button>",
                    "</div>",
                    "<div id='levelsbuttons' class='btn-group filters' data-toggle='buttons-checkbox'>",
                        "<button value='elementary' id='elementary' type='button' class='btn btn-primary active'>Elementary</button>",
                        "<button value='middle' id='middle' type='button' class='btn btn-primary active'>Middle</button>",
                        "<button value='high' id='high' type='button' class='btn btn-primary active'>High</button>",
                    "</div>",
                "</p>",
                "<div id='neighborhood-info'></div>"].join("\n"),
            neighborhoodInfo: _.template([
                "<h1><%= neighborhood.NBH_NAMES %></h1>"
            ].join("\n"), null, { 'variable': 'neighborhood' }),
            init: function () {
                updateButtonStatus();
                $(".filters").on("click.neighborhood", "button", function (e) { updateFilters(e); this.update(); });
            },
            update: function () {
                if (globalFilter.cluster) {
                    $("#neighborhood-info").html(this.neighborhoodInfo(_.where(data.clusters().features, {"id": globalFilter.cluster})[0].properties));
                    map.displayEdges(globalFilter);
                }
            },
            strike: function () {
                $(".filters").off(".neighborhood");
                map.edges.clearLayers();
                delete globalFilter.cluster;
            }
        }
    };
}());