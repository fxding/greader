"use strict";

function DB(config) {
  var GithubApi = require('github');
  this.github = new GithubApi({version: "3.0.0"});
  this.db = null;
  this.config = config;
}

DB.prototype.init = function () {

  if (this.db) {
    return this.db;
  }

  var fs = require("fs");
  var sqlite = require("sql.js");

  function createOrReadDatabase(path) {
    var yes = fs.existsSync(path);
    if(yes) {
      var data = fs.readFileSync('readme.sqlite');
      if (!data) {
        return ;
      }
      return new sqlite.Database(data);
    } else {
      try {
        var db = new sqlite.Database();
        // Run a query without reading the results
        db.run("CREATE TABLE test (full_name, html_url, language, description, owner_html_url);");
        db.run("create unique index if not exists full_name_idx on test(full_name)");
        var buffer = new Buffer(db.export());
        fs.writeFileSync(path, buffer);
        return db;
      } catch(e) {
        console.log(e);
      }
    }
  }
  this.db = createOrReadDatabase("readme.sqlite");
  return this.db;
};


DB.prototype.add = function (repo) {
  var fs = require("fs");
  var p = Promise.resolve(repo);
  var self = this;
  return p.then(function (repo) {
    return new Promise(function (resolve, reject) {
      self.github.repos.getReadme({headers: {Accept: "application/vnd.github.v3.html"}, user: repo.user, repo: repo.name}, function (err, page) {
        if (err) {
          reject(err);
        } else if (!page) {
          reject("No readme file");
        } else {
          var name = repo.user + "_" + repo.name;
          name = name.replace(/\.|\//g, '_');
          fs.writeFile("readme/" + name + ".html", page, function (err) {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
      });
    });
  }).then(function () {
    return new Promise(function (resolve, reject) {
      self.github.repos.get({user: repo.user, repo: repo.name}, function (err, data) {
        if (err) {
          return reject(err);
        }
        try {
          self.db.run("INSERT INTO test VALUES (?,?,?,?,?)", [data.full_name, data.html_url, data.language, data.description, data.owner.html_url]);
          var d = self.db.export();
          var buffer = new Buffer(d);
          fs.writeFile("readme.sqlite", buffer, function (err) {
            if (err) {
              return reject(err);
            }
            resolve();
          });
        } catch(e) {
          reject(e);
        }
      });
    });
  });
};


module.exports = exports = DB;