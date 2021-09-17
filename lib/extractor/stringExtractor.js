"use strict";

var acorn, coffee, _findInHbsProgramNode, fs, glob, handlebars, hbsfy, path, typescript, walk;

fs = require('fs');
glob = require('glob');
path = require('path');
coffee = require('coffeescript');
handlebars = require('handlebars');
acorn = require("acorn");
walk = require("acorn-walk");
hbsfy = require('hbsfy');
typescript = require('typescript'); // rootDirs are the directories to find files in. node_modules is never entered. Can be files as well, in which case the file is used
// callback is called with list of strings

exports.findFromRootDirs = function (rootDirs, callback) {
  var contents, ext, filename, filenames, fullFilename, i, j, len, len1, rootDir, strings;
  strings = [];

  for (i = 0, len = rootDirs.length; i < len; i++) {
    rootDir = rootDirs[i];

    if (fs.lstatSync(rootDir).isDirectory()) {
      filenames = glob.sync("**/*.@(js|coffee|tsx|ts|hbs)", {
        cwd: rootDir
      });
    } else {
      filenames = ["."];
    }

    for (j = 0, len1 = filenames.length; j < len1; j++) {
      filename = filenames[j]; // Skip node_modules

      if (filename.match(/node_modules/)) {
        continue;
      }

      if (filename !== ".") {
        fullFilename = path.resolve(rootDir, filename);
      } else {
        fullFilename = path.resolve(rootDir);
      }

      console.log(fullFilename);
      contents = fs.readFileSync(fullFilename, 'utf-8');
      ext = path.extname(fullFilename);

      switch (ext) {
        case '.coffee':
          strings = strings.concat(exports.findInCoffee(contents));
          break;

        case '.js':
          strings = strings.concat(exports.findInJs(contents));
          break;

        case '.hbs':
          strings = strings.concat(exports.findInHbs(contents));
          break;

        case '.ts':
          strings = strings.concat(exports.findInTs(contents));
          break;

        case '.tsx':
          strings = strings.concat(exports.findInTsx(contents));
      }
    }
  }

  return callback(strings);
};

exports.findInJs = function (js) {
  var items;
  items = [];
  walk.simple(acorn.parse(js), {
    CallExpression: function CallExpression(node) {
      var ref, ref1, ref2, ref3, ref4, ref5, ref6;

      if (((ref = node.callee) != null ? ref.name : void 0) === "T" && typeof ((ref1 = node.arguments[0]) != null ? ref1.value : void 0) === "string") {
        return items.push((ref2 = node.arguments[0]) != null ? ref2.value : void 0);
      } else if (((ref3 = node.callee) != null ? (ref4 = ref3.property) != null ? ref4.name : void 0 : void 0) === "T" && typeof ((ref5 = node.arguments[0]) != null ? ref5.value : void 0) === "string") {
        return items.push((ref6 = node.arguments[0]) != null ? ref6.value : void 0);
      }
    }
  });
  return items;
};

exports.findInCoffee = function (cs) {
  var js; // Compile coffeescript

  js = coffee.compile(cs);
  return exports.findInJs(js);
};

_findInHbsProgramNode = function findInHbsProgramNode(node) {
  var i, items, len, ref, stat;
  items = [];
  ref = node.statements;

  for (i = 0, len = ref.length; i < len; i++) {
    stat = ref[i];

    if (stat.type === "mustache" && stat.id.string === "T") {
      items.push(stat.params[0].string);
    }

    if (stat.type === "block") {
      if (stat.program) {
        items = items.concat(_findInHbsProgramNode(stat.program));
      }

      if (stat.inverse) {
        items = items.concat(_findInHbsProgramNode(stat.inverse));
      }
    }
  }

  return items;
};

exports.findInHbs = function (hbs) {
  var items, tree;
  items = [];
  tree = handlebars.parse(hbs);
  return _findInHbsProgramNode(tree);
};

exports.findInTs = function (ts) {
  var js;
  js = typescript.transpileModule(ts, {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS
    }
  });
  return exports.findInJs(js.outputText);
};

exports.findInTsx = function (tsx) {
  var js;
  js = typescript.transpileModule(tsx, {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      jsx: 'react'
    }
  });
  return exports.findInJs(js.outputText);
};