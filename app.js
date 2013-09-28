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
    // PUBLIC METHODS
    //
    // map.displayEdges(filter)
    // Adds all edges matching the filter to the map. Generally expects to see
    // at least "school_code" or "cluster" included in the filter parameters.
    // E.g. -> map.displayEdges({"cluster": 6})

    newMap,

    // For testing.

    utils,

    // UTILITY FUNCTIONS
    //
    // utils.oa2ao(object)
    // Takes an object of arrays and translates it into an
    // array of objects, which is more easily manipulated.
    //
    // utils.grades
    // An array of break points for color gradation.
    //
    // utils.getColor(number)
    // Returns the corresponding color for a given value.
    //
    // utils.lineOpacity(number)
    // Returns the corresponding opacity for a given value.

    ATTRIBUTION = "Map data &copy;<a href='http://openstreetmap.org'>OpenStreetMap</a> contributors, <a href='http://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery &copy;<a href='http://cloudmade.com'>CloudMade</a>",
    TILE_URL = "http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/53124/256/{z}/{x}/{y}.png",
    CLUSTERS_URL = "clusters.geojson",
    CLUSTER_CENTERS_URL = "data/nc_names_centers.json",
    SCHOOLS_URL = "data/schools.json",
    EDGES_URL = "data/commute_data_denorm.json";

(function () {
    "use strict";

    $(function () {
        newMap = new Map('newMap');
    });

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
            var success = function (data) { edges = utils.oa2ao(data); },
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
                return filter ? _.where(schools, filter) : schools;
            },
            edges: function (filter) {
                if (!edges) { getEdges(); }
                return filter ? _.where(edges, filter) : edges;
            }
        };
    }());

    Map = function (el) {
        this.superclass(el, { minZoom: 11, maxZoom: 14 });
        this.setView([38.895111, -77.036667], 12);
        L.tileLayer(TILE_URL, { attribution: ATTRIBUTION }).addTo(this);

        this.clusters = L.geoJson(data.clusters(), {
            map: this,
            style: {
                fillColor: '#3875A3',
                weight: 2,
                opacity: 0.7,
                color: '#12446A',
                fillOpacity: 0.5
            },
            onEachFeature: function (feature, layer) {
                var highlight, reset, click,
                    map = this.map;

                highlight = function (e) {
                    var layer = e.target;
                    layer.setStyle({ weight: 5, opacity: 1 });
                    map.infobox.update(layer.feature.properties.NBH_NAMES);
                };

                reset = function (e) {
                    map.clusters.resetStyle(e.target);
                    map.infobox.update();
                };

                click = function (e) { map.displayEdges({ "cluster": e.target.feature.id }); };

                layer.on({
                    mouseover: highlight,
                    mouseout: reset,
                    click: click
                });
            }
        }).addTo(this);

        this.edges = L.layerGroup().addTo(this);
        this.edgeOrigin = "cluster";

        this.infobox = L.control();
        this.infobox.onAdd = function () {
            this.div = L.DomUtil.create('div', 'info');
            this.update();
            return this.div;
        };
        this.infobox.update = function (text) {
            this.div.innerHTML = text || "Hover over to learn more";
        };
        this.infobox.addTo(this);

        this.legend = L.control({position: 'bottomleft'});
        this.legend.onAdd = function () {
            var that = this;
            this.div = L.DomUtil.create('div', 'info legend');
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
    };

    Map.prototype = L.Map.prototype;
    Map.prototype.superclass = L.Map;

    Map.prototype.displayEdges = function (filter) {
        var highlight, reset, click,
            map = this,
            edges = data.edges(filter),
            layerGroup = this.edges;

        this.edgeOrigin = _.has(filter, "school_code") ? "school" : "cluster";

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
            if (map.edgeOrigin === "cluster") {
                map.displayEdges({ "school_code": e.target.options.school_code });
            } else {
                map.displayEdges({ "cluster": e.target.options.cluster_id });
            }
        };

        layerGroup.clearLayers();

        _(edges).forEach(function (edge) {
            var props, weight, opacity, color, text, lineseg,
                cluster = _.where(data.clusters().features, {"id": edge.cluster})[0];

            if (cluster && typeof edge.latitude === 'number') {
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

        $(this.legend.div).show();
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

        grades: [0, 10, 20, 50, 80, 120, 150],

        getColor: function (d) {
            /*jslint white: true */
            return d > utils.grades[6] ? '#800026':
                   d > utils.grades[5] ? '#BD0026':
                   d > utils.grades[4] ? '#E31A1C':
                   d > utils.grades[3] ? '#FC4E2A':
                   d > utils.grades[2] ? '#FD8D3C':
                   d > utils.grades[1] ? '#FEB24C':
                                         '#FFEDA0';
        },

        lineOpacity: function (d) {
            return d < 2 ? 0.4 : d < 100 ? 0.4 + (d / 100.0) * 0.5 : 0.9;
        }
    };

}());