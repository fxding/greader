'use strict';

var Q = require('q');
var jetpack = require('fs-jetpack');
var utils = require('./utils');

var projectDir;
var releasesDir;
var finalAppDir;
var manifest;

var init = function () {
    projectDir = jetpack;
    releasesDir = projectDir.dir('./releases', { empty: true });
    manifest = projectDir.read('app/package.json', 'json');
    finalAppDir = releasesDir.cwd(manifest.name + '.app');
    return Q();
};

var copyRuntime = function () {
    return projectDir.copyAsync('node_modules/electron-prebuilt/dist/Electron.app', finalAppDir.path());
};

var copyBuiltApp = function () {
    return projectDir.copyAsync('build', finalAppDir.path('Contents/Resources/app'));
};

var finalize = function () {
    // Prepare main Info.plist
    var info = projectDir.read('resources/osx/Info.plist');
    info = utils.replace(info, {
        productName: manifest.name,
        identifier: manifest.identifier,
        version: manifest.version
    });
    finalAppDir.write('Contents/Info.plist', info);

    // Copy icon
    projectDir.copy('resources/osx/icon.icns', finalAppDir.path('Contents/Resources/icon.icns'));

    return Q();
};

module.exports = function () {
    return init()
    .then(copyRuntime)
    .then(copyBuiltApp)
    .then(finalize);
};
