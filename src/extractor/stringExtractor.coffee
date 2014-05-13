mdeps = require 'module-deps'
through = require 'through'
path = require 'path'
uglify = require 'uglify-js'
coffee = require 'coffee-script'
handlebars = require 'handlebars'
fs = require 'fs'

# rootFile is path of starting point
# Options include: (they are passed to browserify)
# extensions: e.g. ['.js', '.coffee']
# transformKey: e.g. "browserify"
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
  , =>
    callback(strings)

  oldFilter = options.filter  
  externalModules = options.externalModules || []

  options.filter = (id) ->
    # Only take relative paths or external modules
    if id.match /^\./ or id in externalModules
      if oldFilter and not oldFilter(id)
        return false

      return true

  mdeps(path.resolve(rootFile), options).pipe(stream)

exports.findInJs = (js) ->
  items = []
  tree = uglify.parse(js)

  walker = new uglify.TreeWalker (node) ->
    # Extract direct calls to T
    if node instanceof uglify.AST_Call and node.expression.name == "T"
      if node.args[0] and typeof node.args[0].value == "string"
        items.push node.args[0].value
    # Extract property calls to T
    if node instanceof uglify.AST_Call and node.expression.property == "T"
      if node.args[0] and typeof node.args[0].value == "string"
        items.push node.args[0].value
  tree.walk(walker)
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

exports.findInFile = (filename, contents) ->
  return []

exports.findInDir = (dir) ->
  return []
