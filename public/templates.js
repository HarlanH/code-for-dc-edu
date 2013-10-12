/*jslint browser: true*/
/*global $, _, map*/

var templates;

(function () {
    "use strict";

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
                        "<button value='public' id='public' type='button' class='btn btn-primary active'>Public</button>",
                    "</div>",
                    "<div id='levelsbuttons' class='btn-group' data-toggle='buttons-checkbox'>",
                        "<button value='elementary' id='elementary' type='button' class='btn btn-primary active'>Elementary</button>",
                        "<button value='middle' id='middle' type='button' class='btn btn-primary active'>Middle</button>",
                        "<button value='high' id='high' type='button' class='btn btn-primary active'>High</button>",
                    "</div>",
                "</p>",
                "<p>",
                    "<div id='wardsbuttons' class='btn-group2' data-toggle='buttons-radio'>",
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
            },
            update: function () {
            },
            strike: function () {
            }
        },
        neighborhood: {
            t: ["<b>Click a neighborhood to see where its students attend school.</b>",
                "<div><b>Use the buttons to hide various school types.</b></div>",
                "<p>",
                    "<div id='systembuttons' class='btn-group' data-toggle='buttons-checkbox'>",
                        "<button value='charter' id='charter' type='button' class='btn btn-primary active'>Charter</button>",
                        "<button value='public' id='public' type='button' class='btn btn-primary active'>Public</button>",
                    "</div>",
                    "<div id='levelsbuttons' class='btn-group' data-toggle='buttons-checkbox'>",
                        "<button value='elementary' id='elementary' type='button' class='btn btn-primary active'>Elementary</button>",
                        "<button value='middle' id='middle' type='button' class='btn btn-primary active'>Middle</button>",
                        "<button value='high' id='high' type='button' class='btn btn-primary active'>High</button>",
                    "</div>",
                "</p>"].join("\n"),
            init: function () {
            },
            update: function () {
            },
            strike: function () {
            }
        }
    }
}());