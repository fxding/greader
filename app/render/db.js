"use strict";

var jetpack = require('fs-jetpack');

function DB() {
  var GithubApi = require('github');
  this.github = new GithubApi({version: "3.0.0"});
  this.db = null;
  this.config = window.env;
  this.userDataDir = jetpack.cwd(require("remote").require("app").getPath("userData"));
}

DB.prototype.init = function () {

  if (this.db) {
    return this.db;
  }

  var fs = require("fs");
  var sqlite = require("sql.js");
  var self = this;
  function createOrReadDatabase(dbname) {
    var yes = fs.existsSync(self.userDataDir.path(dbname));
    if(yes) {
      var data = fs.readFileSync(self.userDataDir.path(dbname));
      if (!data) {
        return ;
      }
      return new sqlite.Database(data);
    } else {
      try {
        var db = new sqlite.Database();
        // Run a query without reading the results
        db.run("CREATE TABLE " + self.config.tableName + " (full_name, html_url, language, description, owner_html_url);");
        db.run("create unique index if not exists full_name_idx on " + self.config.tableName + "(full_name)");
        var buffer = new Buffer(db.export());
        self.userDataDir.write(dbname, buffer);
        return db;
      } catch(e) {
        console.log(e);
      }
    }
  }
  this.db = createOrReadDatabase(this.config.dbFileName);
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
          self.userDataDir.writeAsync(name + ".html", page).then(resolve, reject);
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
          self.db.run("INSERT INTO " + self.config.tableName + " VALUES (?,?,?,?,?)", [data.full_name, data.html_url, data.language, data.description, data.owner.html_url]);
          var d = self.db.export();
          var buffer = new Buffer(d);
          self.userDataDir.writeAsync(self.config.dbFileName, buffer).then(resolve, reject);
        } catch(e) {
          reject(e);
        }
      });
    });
  });
};


module.exports = exports = DB;
