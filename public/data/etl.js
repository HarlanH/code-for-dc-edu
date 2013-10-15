#!/usr/bin/env node

// this script will (re)create the data needed for the application

// run like:
// MONGO_PW=password ./etl.js

var request = require('request');
var csv = require('csv');
var assert = require('assert');

var mongostr = "mongodb://heroku_app18454555:" + process.env.MONGO_PW + "@ds049548.mongolab.com:49548/heroku_app18454555";

var MongoClient = require('mongodb').MongoClient;

var commute_source = "http://ec2-54-235-58-226.compute-1.amazonaws.com/storage/f/2013-10-06T22%3A00%3A45.032Z/school-cluster-mapping-2012-v2.csv";

// pull the commute CSV, drop school name, convert NC to number, then push
function commute_process(csvstr, col_commute, cb) {
	
	csv()
	.from(csvstr, {columns: true})
	.transform(function(row) {
		var res = row.cluster.match(/Cluster (\d+)/);
		if (res) {
			row.cluster = res[1];
		} else {
			row.cluster = "";
		}
		
	  	return row;
	})
	.on('record', function(row) {
		cleanedrow = {
			school_code: parseInt(row.school_code),
			cluster: parseInt(row.cluster),
			count: parseInt(row.count)
		};
		console.log(cleanedrow);
		col_commute.insert(cleanedrow, {w:1}, function(err, result) { assert.equal(null, err); });
	})
	.on('end', function(count){
	  console.log('Number of lines: '+count);
	  cb();
	});
	// .to.stream(process.stdout, {
	// 	columns: ['school_code', 'cluster', 'count'],
	// 	header: true
	// })
	console.log("end of commute_process()")
};

function write_commute(body) {
	MongoClient.connect(mongostr, function(err, db) {
		if(!err) {
			console.log("We are connected");
			var col_commute = db.collection('commute');
			col_commute.remove({}, {w:0});
			console.log("Commute collection wiped");
			commute_process(body, col_commute, function() {db.close();});
			// db.close();
			console.log("We're done!")
		}
	});
}

request(commute_source, function (error, response, body) {
	if (!error && response.statusCode == 200) {
		write_commute(body);
	}
});

