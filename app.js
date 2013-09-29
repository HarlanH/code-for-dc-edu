/*jslint browser: true*/
/*jslint nomen: true*/
/*global $, _, L*/

var data,

    // PUBLIC METHODS
    //
    // data.clusters()
    // Returns the neighborhood clusters geoJSON object with the nc centers merged as a property.
    //
    // data.schools(filter)
    // Returns a collection of all schools matching the filter.
    // E.g. -> data.schools({"charter_status": false})
    //
    // data.edges(filter)
    // Returns a collection of all edges matching the filter.
    // E.g. -> data.edges({"school_code": 1100})

    Map,

    // Construct with map = new Map(element); where element is the ID of a DOM element.
    //
    // Inherits from Leaflet's L.Map.
    //
    // PUBLIC METHODS
    //
    // map.displayEdges(filter)
    // Adds all edges matching the filter to the map. Generally expects to see
    // at least "school_code" or "cluster" included in the filter parameters.
    // E.g. -> map.displayEdges({"cluster": 6})
    //
    // PROPERTIES
    //
    // map.clusters
    // A Leaflet geoJSON layer containing all of the neighborhood clusters.
    //
    // map.edges
    // A layergroup for the edge polylines. Clear with map.edges.clearLayers().
    //
    // map.edgeOrigin
    // Indicates whether displayed edges are originating from a "school" or a "cluster".
    //
    // map.infobox
    // A Leaflet control for tooltip info. Update with map.infobox.update(string).
    //
    // map.legend
    // A Leaflet control depicting edge colors. Hidden by default. Reveal with map.legend.show().

    utils,

    // UTILITY FUNCTIONS
    //
    // utils.oa2ao(object)
    // Takes an object of arrays and translates it into an
    // array of objects, which is more easily manipulated.
    //
    // utils.levelsFilter(collection, filter)
    // Applies a filter containing "levels" inclusively.
    //
    // utils.grades
    // An array of break points for color gradation.
    //
    // utils.getColor(number)
    // Returns the corresponding color for a given value.
    //
    // utils.lineOpacity(number)
    // Returns the corresponding opacity for a given value.

    globalFilter = {};

    // We'll always update and pass this global to map.displayEdges() so
    // that multiple controls can consistently update the edge display.

(function () {
    "use strict";

    var ATTRIBUTION = "Map data &copy;<a href='http://openstreetmap.org'>OpenStreetMap</a> contributors, <a href='http://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery &copy;<a href='http://cloudmade.com'>CloudMade</a>",
        TILE_URL = "http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/53124/256/{z}/{x}/{y}.png",
        CLUSTERS_URL = "clusters.geojson",
        CLUSTER_CENTERS_URL = "data/nc_names_centers.json",
        SCHOOLS_URL = "data/schools.json",
        EDGES_URL = "data/commute_data_denorm.json";

    if (window.location.hash) {
        if (window.location.pathname === "/school.html") {
            globalFilter.school_code = parseInt(window.location.hash.split('#')[1], 10);
        } else if (window.location.pathname === "/neighborhood.html") {
            globalFilter.cluster = parseInt(window.location.hash.split('#')[1], 10);
        }
    }

    data = (function () {
        var clusters, getClusters,
            schools, getSchools,
            edges, getEdges;

        getClusters = function () {
            var centers,
                success = function () {
                    _(clusters.features).each(function (nc) {
                        var id = parseInt(nc.properties.GIS_ID.substring(8), 10);
                        nc.id = id;
                        nc.properties.center = _.find(centers, { "id": id });
                    });
                },
                error = function (error) { };

            $.when(
                $.ajax({
                    dataType: "json",
                    url: CLUSTERS_URL,
                    data: {},
                    async: false,
                    success: function (data) { clusters = data; },
                    error: error
                }),
                $.ajax({
                    dataType: "json",
                    url: CLUSTER_CENTERS_URL,
                    data: {},
                    async: false,
                    success: function (data) { centers = utils.oa2ao(data); },
                    error: error
                })
            ).then(success);

            return clusters;
        };

        getSchools = function () {
            var success = function (data) { schools = _.values(data); },
                error = function (error) { };
            $.ajax({
                dataType: "json",
                url: SCHOOLS_URL,
                data: {},
                async: false,
                success: success,
                error: error
            });

            return schools;
        };

        getEdges = function () {
            var success = function (data) {
                    edges = utils.oa2ao(data);
                    _(edges).each(function (edge) {
                        edge.elementary = (edge.prek_3 || edge.prek_4 || edge.preschool ||
                                           edge.kindergarten || edge.grade_1 || edge.grade_2 ||
                                           edge.grade_3 || edge.grade_4 || edge.grade_5);

                        edge.middle =     (edge.grade_6 || edge.grade_7 || edge.grade_8);

                        edge.high =       (edge.grade_9 || edge.grade_10 || edge.grade_11 ||
                                           edge.grade_12);
                    });
                },
                error = function (error) { };
            $.ajax({
                dataType: "json",
                url: EDGES_URL,
                data: {},
                async: false,
                success: success,
                error: error
            });

            return edges;
        };

        return {
            clusters: function () {
                return clusters || getClusters();
            },
            schools: function (filter) {
                if (!schools) { getSchools(); }
                if (_.has(filter, "levels")) { return utils.levelsFilter(schools, filter); }
                return (_.keys(filter).length > 0) ? _.where(schools, filter) : schools;
            },
            edges: function (filter) {
                if (!edges) { getEdges(); }
                if (_.has(filter, "levels")) { return utils.levelsFilter(edges, filter); }
                return (_.keys(filter).length > 0) ? _.where(edges, filter) : edges;
            }
        };
    }());

    Map = function (el, disableClusterClicks) {
        var map = this;

        this.superclass(el, { minZoom: 11, maxZoom: 14 });
        this.setView([38.895111, -77.036667], 12);
        L.tileLayer(TILE_URL, { attribution: ATTRIBUTION }).addTo(this);

        this.disableClusterClicks = disableClusterClicks || false;

        this.clusters = L.geoJson(data.clusters(), {
            style: {
                fillColor: "#3875A3",
                weight: 2,
                opacity: 0.7,
                color: "#12446A",
                fillOpacity: 0.5
            },
            onEachFeature: function (feature, layer) {
                var highlight, reset, click;

                highlight = function (e) {
                    e.target.setStyle({ weight: 5, opacity: 1 });
                    map.infobox.update(e.target.feature.properties.NBH_NAMES);
                };

                reset = function (e) {
                    map.clusters.resetStyle(e.target);
                    map.infobox.update();
                };

                click = function (e) {
                    delete globalFilter.school_code;
                    globalFilter.cluster = e.target.feature.id;
                    map.displayEdges(globalFilter);
                };

                layer.on({
                    mouseover: highlight,
                    mouseout: reset
                });

                if (!map.disableClusterClicks) { layer.on({ click: click }); }
            }
        }).addTo(this);

        this.edges = L.layerGroup().addTo(this);

        this.infobox = L.control();
        this.infobox.onAdd = function () {
            this.div = L.DomUtil.create("div", "info");
            this.update();
            return this.div;
        };
        this.infobox.update = function (text) {
            this.div.innerHTML = text || "Hover over to learn more";
        };
        this.infobox.addTo(this);

        this.legend = L.control({position: "bottomleft"});
        this.legend.onAdd = function () {
            var that = this;
            this.div = L.DomUtil.create("div", "info legend");
            _(utils.grades).each(function (grade, i) {
                if (i !== 0) { that.div.innerHTML += "&ndash;" + grade + "<br>"; }
                that.div.innerHTML +=
                    "<i style='background:" + utils.getColor(grade + 1) + ";'></i> " + (grade + 1);
            });
            this.div.innerHTML += "+";
            return this.div;
        };
        this.legend.addTo(this);
        $(this.legend.div).hide();
        this.legend.show = _.once(function () { $(this.div).fadeIn(); });
        if (_.keys(globalFilter).length > 0) { map.displayEdges(globalFilter); }
    };

    Map.prototype = L.Map.prototype;
    Map.prototype.superclass = L.Map;

    Map.prototype.displayEdges = function (filter) {
        var highlight, reset, click,
            map = this,
            layerGroup = this.edges,
            edges = _.sortBy(data.edges(filter), "count");

        if (filter.cluster) {
            this.edgeOrigin = "cluster";
            if (window.location.pathname === "/neighborhood.html") {
                window.location.hash = "#" + filter.cluster;
            } else {
                window.location.href = "/neighborhood.html#" + filter.cluster;
            }
        } else if (filter.school_code) {
            this.edgeOrigin = "school";
            if (window.location.pathname === "/school.html") {
                window.location.hash = "#" + filter.school_code;
            } else {
                window.location.href = "/school.html#" + filter.school_code;
            }
        }

        highlight = function (e) {
            var layer = e.target;
            layer.setStyle({ weight: layer.options.weight + 3, opacity: 1 });
            map.infobox.update(layer.options.text);
        };

        reset = function (e) {
            var layer = e.target;
            layer.setStyle({
                weight: layer.options.orig_weight,
                opacity: layer.options.orig_opacity
            });
            map.infobox.update();
        };

        click = function (e) {
            if (map.edgeOrigin !== "school") {
                delete globalFilter.cluster;
                globalFilter.school_code = e.target.options.school_code;
                map.displayEdges(globalFilter);
            } else {
                delete globalFilter.school_code;
                globalFilter.cluster = e.target.options.cluster_id;
                map.displayEdges(globalFilter);
            }
        };

        layerGroup.clearLayers();

        _(edges).forEach(function (edge) {
            var props, weight, opacity, color, text, lineseg,
                cluster = _.where(data.clusters().features, {"id": edge.cluster})[0];

            if (cluster && typeof edge.latitude === "number") {
                props = cluster.properties;
                weight = 3 + ((edge.count < 10) ? 0 : Math.sqrt(edge.count / 4.0));
                opacity = utils.lineOpacity(edge.count);
                color = utils.getColor(edge.count);
                text = props.NBH_NAMES + " -> " + edge.school_name + ": " +
                    ((edge.count < 10) ? "few" : edge.count) + " students";
                lineseg = L.polyline([[edge.latitude, edge.longitude],
                                      [props.center.lat_ctr, props.center.lon_ctr]],
                    {
                        cluster_id: cluster.id,
                        school_code: edge.school_code,
                        weight: weight,
                        orig_weight: weight,
                        opacity: opacity,
                        orig_opacity: opacity,
                        color: color,
                        orig_color: color,
                        text: text
                    });

                lineseg.addTo(layerGroup);

                lineseg.on({ mouseover: highlight, mouseout: reset, click: click });
            }
        });

        this.legend.show();
    };

    utils = {
        oa2ao: function (obj) {
            var i, item, buildItem,
                arr = [],
                keys = _.keys(obj),
                len = obj[keys[0]].length;

            buildItem = function (key) { item[key] = obj[key][i]; };
            for (i = 0; i < len; i += 1) {
                item = {};
                _(keys).each(buildItem);
                arr.push(item);
            }

            return arr;
        },

        levelsFilter: function (collection, filter) {
            var results;
            if (_.keys(filter).length > 1) {
                results = _.where(collection, _.omit(filter, "levels"));
            } else {
                results = collection;
            }
            results = _.filter(results, function (obj) {
                return _(obj).pick(filter.levels).any();
            });
            return results;
        },

        grades: [0, 10, 20, 50, 80, 120, 150],

        getColor: function (d) {
            /*jslint white: true */
            return d > utils.grades[6] ? "#800026":
                   d > utils.grades[5] ? "#BD0026":
                   d > utils.grades[4] ? "#E31A1C":
                   d > utils.grades[3] ? "#FC4E2A":
                   d > utils.grades[2] ? "#FD8D3C":
                   d > utils.grades[1] ? "#FEB24C":
                                         "#FFEDA0";
        },

        lineOpacity: function (d) {
            return d < 2 ? 0.4 : d < 100 ? 0.4 + (d / 100.0) * 0.5 : 0.9;
        }
    };

}());