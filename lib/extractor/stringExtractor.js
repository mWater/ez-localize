var acorn, coffee, coffeeify, findInHbsProgramNode, fs, handlebars, hbsfy, mdeps, path, through, tscriptify, typescript, walk,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

mdeps = require('module-deps');

through = require('through');

path = require('path');

acorn = require('acorn');

coffee = require('coffeescript');

handlebars = require('handlebars');

acorn = require("acorn");

walk = require("acorn-walk");

fs = require('fs');

coffeeify = require('coffeeify');

hbsfy = require('hbsfy');

tscriptify = require('tscriptify');

typescript = require('typescript');

exports.findFromRootFile = function(rootFile, options, callback) {
  var externalModules, md, oldFilter, stream, strings;
  strings = [];
  stream = through((function(_this) {
    return function(item) {
      var ext, filename;
      filename = item.id;
      ext = path.extname(filename);
      switch (ext) {
        case '.coffee':
          return strings = strings.concat(exports.findInCoffee(fs.readFileSync(filename, 'utf-8')));
        case '.js':
          return strings = strings.concat(exports.findInJs(fs.readFileSync(filename, 'utf-8')));
        case '.hbs':
          return strings = strings.concat(exports.findInHbs(fs.readFileSync(filename, 'utf-8')));
        case '.ts':
          return strings = strings.concat(exports.findInTs(fs.readFileSync(filename, 'utf-8')));
      }
    };
  })(this), (function(_this) {
    return function() {
      return callback(strings);
    };
  })(this));
  oldFilter = options.filter;
  externalModules = options.externalModules || [];
  options.filter = function(id) {
    if (id.match(/^\./) || (__indexOf.call(externalModules, id) >= 0)) {
      if (oldFilter && !oldFilter(id)) {
        return false;
      }
      return true;
    }
  };
  md = mdeps({
    extensions: ['.js', '.coffee', '.hbs', '.ts'],
    transform: [coffeeify, hbsfy, tscriptify]
  });
  md.pipe(stream);
  return md.end({
    file: path.resolve(rootFile)
  });
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
