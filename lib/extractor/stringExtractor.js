var acorn, coffee, findInHbsProgramNode, fs, glob, handlebars, hbsfy, path, typescript, walk;

fs = require('fs');

glob = require('glob');

path = require('path');

coffee = require('coffeescript');

handlebars = require('handlebars');

acorn = require("acorn");

walk = require("acorn-walk");

hbsfy = require('hbsfy');

typescript = require('typescript');

exports.findFromRootDirs = function(rootDirs, callback) {
  var contents, ext, filename, filenames, fullFilename, rootDir, strings, _i, _j, _len, _len1;
  strings = [];
  for (_i = 0, _len = rootDirs.length; _i < _len; _i++) {
    rootDir = rootDirs[_i];
    filenames = glob.sync("**/*.@(js|coffee|ts|hbs)", {
      cwd: rootDir
    });
    for (_j = 0, _len1 = filenames.length; _j < _len1; _j++) {
      filename = filenames[_j];
      if (filename.match(/node_modules/)) {
        continue;
      }
      fullFilename = path.resolve(rootDir, filename);
      console.log(filename);
      contents = fs.readFileSync(fullFilename, 'utf-8');
      ext = path.extname(filename);
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
      }
    }
  }
  return callback(strings);
};

exports.findInJs = function(js) {
  var items;
  items = [];
  walk.simple(acorn.parse(js), {
    CallExpression: (function(_this) {
      return function(node) {
        var _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
        if (((_ref = node.callee) != null ? _ref.name : void 0) === "T" && typeof ((_ref1 = node["arguments"][0]) != null ? _ref1.value : void 0) === "string") {
          return items.push((_ref2 = node["arguments"][0]) != null ? _ref2.value : void 0);
        } else if (((_ref3 = node.callee) != null ? (_ref4 = _ref3.property) != null ? _ref4.name : void 0 : void 0) === "T" && typeof ((_ref5 = node["arguments"][0]) != null ? _ref5.value : void 0) === "string") {
          return items.push((_ref6 = node["arguments"][0]) != null ? _ref6.value : void 0);
        }
      };
    })(this)
  });
  return items;
};

exports.findInCoffee = function(cs) {
  var js;
  js = coffee.compile(cs);
  return exports.findInJs(js);
};

findInHbsProgramNode = function(node) {
  var items, stat, _i, _len, _ref;
  items = [];
  _ref = node.statements;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    stat = _ref[_i];
    if (stat.type === "mustache" && stat.id.string === "T") {
      items.push(stat.params[0].string);
    }
    if (stat.type === "block") {
      if (stat.program) {
        items = items.concat(findInHbsProgramNode(stat.program));
      }
      if (stat.inverse) {
        items = items.concat(findInHbsProgramNode(stat.inverse));
      }
    }
  }
  return items;
};

exports.findInHbs = function(hbs) {
  var items, tree;
  items = [];
  tree = handlebars.parse(hbs);
  return findInHbsProgramNode(tree);
};

exports.findInTs = function(ts) {
  var js;
  js = typescript.transpileModule(ts, {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS
    }
  });
  return exports.findInJs(js.outputText);
};
