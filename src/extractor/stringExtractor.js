// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import fs from 'fs';
import glob from 'glob';
import path from 'path';
import coffee from 'coffeescript';
import handlebars from 'handlebars';
import acorn from "acorn";
import walk from "acorn-walk";
import hbsfy from 'hbsfy';
import typescript from 'typescript';

// rootDirs are the directories to find files in. node_modules is never entered. Can be files as well, in which case the file is used
// callback is called with list of strings
export function findFromRootDirs(rootDirs, callback) {
  let strings = [];
  
  for (let rootDir of rootDirs) {
    var filenames;
    if (fs.lstatSync(rootDir).isDirectory()) {
      filenames = glob.sync("**/*.@(js|coffee|tsx|ts|hbs)", { cwd: rootDir });
    } else { 
      filenames = ["."];
    }

    for (let filename of filenames) {
      // Skip node_modules
      var fullFilename;
      if (filename.match(/node_modules/)) {
        continue;
      }

      if (filename !== ".") {
        fullFilename = path.resolve(rootDir, filename);
      } else {
        fullFilename = path.resolve(rootDir);
      }
      console.log(fullFilename);
      const contents = fs.readFileSync(fullFilename, 'utf-8');

      const ext = path.extname(fullFilename);
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
          break;
      }
    }
  }

  return callback(strings);
}

export function findInJs(js) {
  const items = [];
  walk.simple(acorn.parse(js), {
    CallExpression: function(node) { 
      if ((node.callee?.name === "T") && (typeof(node.arguments[0]?.value) === "string")) {
        return items.push(node.arguments[0]?.value);
      } else if ((node.callee?.property?.name === "T") && (typeof(node.arguments[0]?.value) === "string")) {
        return items.push(node.arguments[0]?.value);
      }
    }.bind(this)
  });
  return items;
}

export function findInCoffee(cs) {
  // Compile coffeescript
  const js = coffee.compile(cs);
  return exports.findInJs(js);
}

function findInHbsProgramNode(node) {
  let items = [];

  for (let stat of node.statements) {
    if ((stat.type === "mustache") && (stat.id.string === "T")) {
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
}

export function findInHbs(hbs) {
  const items = [];

  const tree = handlebars.parse(hbs);
  return findInHbsProgramNode(tree);
}

export function findInTs(ts) {
  const js = typescript.transpileModule(ts, {
    compilerOptions: { module: typescript.ModuleKind.CommonJS }
  });
  return exports.findInJs(js.outputText);
}

export function findInTsx(tsx) {
  const js = typescript.transpileModule(tsx, {
    compilerOptions: { 
      module: typescript.ModuleKind.CommonJS, 
      jsx: 'react'
    }
  });
  return exports.findInJs(js.outputText);
}