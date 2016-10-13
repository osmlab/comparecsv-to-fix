#!/usr/bin/env node

'use strict';
var fs = require('fs');
var request = require('request');
var readline = require('readline');
var argv = require('minimist')(process.argv.slice(2));
var urlTask = argv.urlTask;
var comparefile = argv._[0];
request(urlTask, function(error, response, body) {
  if (!error && response.statusCode == 200) {
    var items = JSON.parse(body);
    var geometryofItems = [];
    for (var i = 0; i < items.length; i++) {
      geometryofItems.push(JSON.stringify(items[i].geometry));
    }
    var rd = readline.createInterface({
      input: fs.createReadStream(comparefile),
      output: process.stdout,
      terminal: false
    });
    rd.on('line', function(line) {
      var geojson = {
        type: 'FeatureCollection',
        features: []
      };
      var newitems = JSON.parse(line);
      for (var i = 0; i < newitems.features.length; i++) {
        var geoString = newitems.features[i].geometry;
        if (items.indexOf(geoString) === -1) {
          geojson.features.push(newitems.features[i]);
        }
      }
      process.stdout.write(JSON.stringify(geojson) + '\n');
    });
  }
});