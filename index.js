#!/usr/bin/env node

'use strict';
var fs = require('fs');
var pg = require('pg');
var _ = require('underscore');
var readline = require('readline');
var tofixdb = require('./src/tofixdb');
var argv = require('minimist')(process.argv.slice(2));

var idtask = argv.idtask;
var comparefile = argv._[0];
tofixdb.getItems(idtask, function(items) {
  var rd = readline.createInterface({
    input: fs.createReadStream(comparefile),
    output: process.stdout,
    terminal: false
  });
  console.log(items[0]);
  rd.on('line', function(line) {
    if (items.indexOf(line) == -1) {
      console.log(line);
    }
  });
});