'use strict';
var queue = require('queue-async');
var _ = require('underscore');
var pg = require('pg');
var user = process.env.DBUsername || 'postgres';
var password = process.env.DBPassword || '';
var address = process.env.DBAddress || 'localhost';
var database = process.env.Database || 'tofix';
var client;
var conString = 'postgres://' +
	user + ':' +
	password + '@' +
	address + '/' +
	database;

module.exports = {
	getItems: function(idtask, done) {
		pg.connect(conString, function(err, client, d) {
			if (err) return console.log(err);
			var task;
			queue(1)
				.defer(function(cb) {
					var query = 'SELECT id, tasktable FROM task_details where id = $1;';
					var cliente = client.query(query, [idtask], function(err, results) {
						task = results.rows[0];
						cb();
					});
				}).defer(function(cb) {
					var query = 'SELECT b.value' +
						' FROM ' + task.id + '_stats as a' +
						' INNER JOIN ' + task.tasktable + ' as b' +
						' ON a.attributes->\'key\' = b.key AND a.attributes->\'action\'=\'noterror\'';
					var cliente = client.query(query, function(err, results) {
						var items = [];
						var header;
						var body;
						var rows = results.rows;
						for (var i = 0; i < rows.length; i++) {
							var obj = JSON.parse(rows[i].value.split('|').join('"'));
							if (i === 0) {
								var header = _.keys(obj);
								items.push(header.join(','));
							} else {
								var item = _.values(obj);
								var way = item[0];
								var geom = item[1];
								if (geom.indexOf('LINESTRING') > -1 || geom.indexOf('MULTIPOINT') > -1) {
									geom = '"' + geom + '"';
								}
								items.push(way + ',' + geom);
							}
						}
						cb(items);
					});
				})
				.awaitAll(function(items) {
					done(items);
					client.end();
				});
		});
	}
};