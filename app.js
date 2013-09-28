/*jslint browser: true*/
/*jslint nomen: true*/
/*global $, _, L*/

(function () {
    "use strict";

    var data,

        // PUBLIC METHODS
        //
        // data.clusters()
        // Returns the neighborhood clusters geoJSON object.
        //
        // data.schools(filter)
        // Returns a collection of all schools matching the filter.
        // E.g. -> data.schools({"charter_status": false})
        //
        // data.edges(filter)
        // Returns a collection of all edges matching the filter.
        // E.g. -> data.edges({"school_code": 1100})

        utils;

        // HELPER FUNCTIONS
        //
        // utils.oa2ao(object)
        // Takes an object of arrays and translates it into an
        // array of objects, which is far more easily manipulated.

    $(function () {
    });

    data = (function () {
        var clusters, getClusters,
            schools, getSchools,
            edges, getEdges,
            CLUSTERS_URL = "clusters.geojson",
            CLUSTER_CENTERS_URL = "data/nc_names_centers.json",
            SCHOOLS_URL = "data/schools.json",
            EDGES_URL = "data/commute_data_denorm.json";

        getClusters = function () {
            var centers,
                success = function () {
                    _(clusters.features).each(function (nc) {
                        var id = parseInt(nc.properties.GIS_ID.substring(8), 10);
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
        }
    };

}());