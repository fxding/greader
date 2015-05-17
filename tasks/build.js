'use strict';

var gulp = require('gulp');
var less = require('gulp-less');
var jetpack = require('fs-jetpack');

var projectDir = jetpack;
var srcDir = projectDir.cwd('./app');
var destDir = projectDir.cwd('./build');


gulp.task('clean', function () {
  return destDir.dirAsync('.', {empty: true});
});

gulp.task('copy', ['clean'], function () {
  return projectDir.copyAsync('app', destDir.path(), { overwrite: true });
});

var lessTask = function () {
  return gulp.src(srcDir.path('/render/css/main.less'))
    .pipe(less())
    .pipe(gulp.dest(destDir.path('render/css')));
};
gulp.task('less', ['clean'], lessTask);

gulp.task('build', ['less', 'copy']);
