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
			// console.log('connected to:', address);
			var task;
			queue(1)
				.defer(function(cb) {
					var query = 'SELECT id, title, source, tasktable, description, updated, status  FROM task_details where id = $1;';
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
						//replace(/\|/gi, '').
						for (var i = 0; i < rows.length; i++) {
							var obj = JSON.parse(rows[i].value.split('|').join('"'));
							if (i == 0) items.push(_.keys(obj).join(','));
							items.push(_.values(obj).join(','));
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