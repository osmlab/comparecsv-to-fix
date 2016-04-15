'use strict';
var queue = require('queue-async');
var _ = require('underscore');
var pg = require('pg');
var user = process.env.DBUsername || 'postgres';
var password = process.env.DBPassword || '';
var address = process.env.DBAddress || 'localhost';
var database = process.env.Database || 'tofix';
var conString = 'postgres://' +
  user + ':' +
  password + '@' +
  address + '/' +
  database;

module.exports = {
  getItems: function(idtask, done) {
    pg.connect(conString, function(err, client) {
      if (err) return console.log(err);
      var subQueries = [];
      queue(1)
        .defer(function(cb) {
          var query = 'SELECT table_name as tasktable FROM information_schema.tables' +
            ' WHERE  table_name LIKE \'' + idtask + '\' || \'%\'' +
            ' AND table_name NOT LIKE \'%_stats\'' +
            ' AND table_name NOT LIKE \'%_noterror\'' +
            ' AND    LENGTH(table_name) = ' + (idtask.length + 3) + ';';
          client.query(query, function(err, results) {
            if (err) {
              console.error(err);
              return;
            }
            results.rows.forEach(function(val) {
              var subQuery = 'SELECT b.value FROM ' + idtask + '_stats as a INNER JOIN ' + val.tasktable + ' as b  ON a.attributes->\'key\' = b.key AND a.attributes->\'action\'=\'noterror\'';
              subQueries.push(subQuery);
            });
            cb();
          });
        })
        .defer(function(cb) {
          subQueries.push('SELECT value FROM ' + idtask + '_noterror');
          var query = subQueries.join(' UNION ') + ';';
          client.query(query, function(err, results) {
            if (err) {
              console.error(err);
              return;
            }
            var items = [];
            var rows = results.rows;
            for (var i = 0; i < rows.length; i++) {
              var obj = JSON.parse(rows[i].value.split('|').join('"'));
              var item = _.values(obj);
              var way = item[0];
              var geom = item[1];
              if (geom) {
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