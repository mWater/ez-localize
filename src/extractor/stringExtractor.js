fs = require 'fs'
glob = require 'glob'
path = require 'path'
coffee = require 'coffeescript'
handlebars = require 'handlebars'
acorn = require("acorn")
walk = require("acorn-walk")
hbsfy = require('hbsfy')
typescript = require('typescript')

# rootDirs are the directories to find files in. node_modules is never entered. Can be files as well, in which case the file is used
# callback is called with list of strings
exports.findFromRootDirs = (rootDirs, callback) ->
  strings = []
  
  for rootDir in rootDirs
    if fs.lstatSync(rootDir).isDirectory()
      filenames = glob.sync("**/*.@(js|coffee|tsx|ts|hbs)", { cwd: rootDir })
    else 
      filenames = ["."]

    for filename in filenames
      # Skip node_modules
      if filename.match(/node_modules/)
        continue

      if filename != "."
        fullFilename = path.resolve(rootDir, filename)
      else
        fullFilename = path.resolve(rootDir)
      console.log(fullFilename)
      contents = fs.readFileSync(fullFilename, 'utf-8')

      ext = path.extname(fullFilename)
      switch ext
        when '.coffee'
          strings = strings.concat(exports.findInCoffee(contents))
        when '.js'
          strings = strings.concat(exports.findInJs(contents))
        when '.hbs'
          strings = strings.concat(exports.findInHbs(contents))
        when '.ts'
          strings = strings.concat(exports.findInTs(contents))
        when '.tsx'
          strings = strings.concat(exports.findInTsx(contents))

  callback(strings)

exports.findInJs = (js) ->
  items = []
  walk.simple(acorn.parse(js), {
    CallExpression: (node) => 
      if node.callee?.name == "T" and typeof(node.arguments[0]?.value) == "string"
        items.push(node.arguments[0]?.value)
      else if node.callee?.property?.name == "T" and typeof(node.arguments[0]?.value) == "string"
        items.push(node.arguments[0]?.value)
  })
  return items

exports.findInCoffee = (cs) ->
  # Compile coffeescript
  js = coffee.compile(cs)
  return exports.findInJs(js)

findInHbsProgramNode = (node) ->
  items = []

  for stat in node.statements
    if stat.type == "mustache" and stat.id.string == "T"
      items.push stat.params[0].string
    if stat.type == "block"
      if stat.program
        items = items.concat(findInHbsProgramNode(stat.program))
      if stat.inverse
        items = items.concat(findInHbsProgramNode(stat.inverse))
  return items

exports.findInHbs = (hbs) ->
  items = []

  tree = handlebars.parse(hbs)
  return findInHbsProgramNode(tree)

exports.findInTs = (ts) ->
  js = typescript.transpileModule(ts, {
    compilerOptions: { module: typescript.ModuleKind.CommonJS }
  });
  return exports.findInJs(js.outputText)

exports.findInTsx = (tsx) ->
  js = typescript.transpileModule(tsx, {
    compilerOptions: { 
      module: typescript.ModuleKind.CommonJS 
      jsx: 'react'
    }
  });
  return exports.findInJs(js.outputText)