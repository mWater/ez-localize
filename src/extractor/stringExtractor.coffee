mdeps = require 'module-deps'
through = require 'through'
path = require 'path'
acorn = require 'acorn'
coffee = require 'coffeescript'
handlebars = require 'handlebars'
acorn = require("acorn")
walk = require("acorn-walk")
fs = require 'fs'
coffeeify = require('coffeeify')
hbsfy = require('hbsfy')
tscriptify = require('tscriptify')
typescript = require('typescript')

# rootFile is path of starting point
# Options include: (they are passed to browserify)
# externalModules: optional list of external modules to include. Otherwise only relative requires are processed
# callback is called with list of strings
exports.findFromRootFile = (rootFile, options, callback) ->
  strings = []
  stream = through (item) =>
    # Extract strings from item
    filename = item.id
    ext = path.extname(filename)

    switch ext
      when '.coffee'
        strings = strings.concat(exports.findInCoffee(fs.readFileSync(filename, 'utf-8')))
      when '.js'
        strings = strings.concat(exports.findInJs(fs.readFileSync(filename, 'utf-8')))
      when '.hbs'
        strings = strings.concat(exports.findInHbs(fs.readFileSync(filename, 'utf-8')))
      when '.ts'
        strings = strings.concat(exports.findInTs(fs.readFileSync(filename, 'utf-8')))
  , =>
    callback(strings)

  oldFilter = options.filter  
  externalModules = options.externalModules || []

  options.filter = (id) ->
    # Only take relative paths or external modules
    if id.match(/^\./) or (id in externalModules)
      if oldFilter and not oldFilter(id)
        return false

      return true

  md = mdeps({ extensions: ['.js', '.coffee', '.hbs', '.ts'], transform: [coffeeify, hbsfy, tscriptify] })
  md.pipe(stream)
  md.end({ file: path.resolve(rootFile) })

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
