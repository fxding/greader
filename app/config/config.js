'use strict';

(function () {
  var jetpack = require('fs-jetpack');
  if (typeof window === 'object') {
    // Web browser context, __dirname points to folder where app.html file is.
    window.env = jetpack.read(require("path").join(__dirname, '../package.json'), 'json');
  } else {
    // Node context
    module.exports = jetpack.read(__dirname + '../package.json', 'json');
  }
}());
