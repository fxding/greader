'use strict';

var gulp = require('gulp');
var utils = require('./utils');

var releaseForOs = {
    osx: require('./release_osx'),
    linux: function () {
      console.log("Not support yet");
    },
    windows: function () {
      console.log("Not support yet");
    }
};

gulp.task('release', ['build'], function () {
    return releaseForOs[utils.os()]();
});
