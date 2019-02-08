fs = require 'fs'
glob = require 'glob'
path = require 'path'
coffee = require 'coffeescript'
handlebars = require 'handlebars'
acorn = require("acorn")
walk = require("acorn-walk")
hbsfy = require('hbsfy')
typescript = require('typescript')

# rootDirs are the root directories to find files in. node_modules is never entered
# callback is called with list of strings
exports.findFromRootDirs = (rootDirs, callback) ->
  strings = []
  
  for rootDir in rootDirs
    filenames = glob.sync("**/*.@(js|coffee|ts|hbs)", { cwd: rootDir })
    for filename in filenames
      # Skip node_modules
      if filename.match(/node_modules/)
        continue

      fullFilename = path.resolve(rootDir, filename)
      console.log(filename)
      contents = fs.readFileSync(fullFilename, 'utf-8')

      ext = path.extname(filename)
      switch ext
        when '.coffee'
          strings = strings.concat(exports.findInCoffee(contents))
        when '.js'
          strings = strings.concat(exports.findInJs(contents))
        when '.hbs'
          strings = strings.concat(exports.findInHbs(contents))
        when '.ts'
          strings = strings.concat(exports.findInTs(contents))

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
