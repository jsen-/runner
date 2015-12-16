#!/usr/bin/env node
var electronPath = require('electron-prebuilt');
require('child_process').exec(electronPath + ' ' + [__dirname].concat(process.argv.splice(2)).join(' '));