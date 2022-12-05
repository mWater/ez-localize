import fs from "fs"
import glob from "glob"
import path from "path"
import handlebars from "handlebars"
import * as acorn from "acorn"
import * as walk from "acorn-walk"
import typescript from "typescript"

// rootDirs are the directories to find files in. node_modules is never entered. Can be files as well, in which case the file is used
// callback is called with list of strings
export function findFromRootDirs(rootDirs: string[], callback: (strs: string[]) => void) {
  let strings: string[] = []

  for (let rootDir of rootDirs) {
    var filenames
    if (fs.lstatSync(rootDir).isDirectory()) {
      filenames = glob.sync("**/*.@(js|tsx|ts|hbs)", { cwd: rootDir })
    } else {
      filenames = ["."]
    }

    for (let filename of filenames) {
      // Skip node_modules
      var fullFilename
      if (filename.match(/node_modules/)) {
        continue
      }

      if (filename !== ".") {
        fullFilename = path.resolve(rootDir, filename)
      } else {
        fullFilename = path.resolve(rootDir)
      }
      console.log(fullFilename)
      const contents = fs.readFileSync(fullFilename, "utf-8")

      const ext = path.extname(fullFilename)
      switch (ext) {
        case ".js":
          strings = strings.concat(findInJs(contents))
          break
        case ".hbs":
          strings = strings.concat(findInHbs(contents))
          break
        case ".ts":
          strings = strings.concat(findInTs(contents))
          break
        case ".tsx":
          strings = strings.concat(findInTsx(contents))
          break
      }
    }
  }

  callback(strings)
}

export function findInJs(this: any, js: any) {
  const items: any = []
  walk.simple(acorn.parse(js, { ecmaVersion: "latest" }), {
    CallExpression: function (node: any) {
      if (node.callee?.name === "T" && typeof node.arguments[0]?.value === "string") {
        items.push(node.arguments[0]?.value)
      } else if (node.callee?.property?.name === "T" && typeof node.arguments[0]?.value === "string") {
        items.push(node.arguments[0]?.value)
      }
    },
    TaggedTemplateExpression: function (node: any) {
      if (node.tag.type == "Identifier" && node.tag.name == "T") {
        let str = ""
        for (let i = 0 ; i < node.quasi.quasis.length ; i++) {
          if (i > 0) {
            str += `{${i - 1}}`
          }
          str += node.quasi.quasis[i].value.raw
        }
        items.push(str)
      }
    },
  })
  return items
}

function findInHbsProgramNode(node: hbs.AST.Program): string[] {
  let items: string[] = []

  for (let stat of node.body) {
    if (stat.type === "MustacheStatement") {
      const mushStat = stat as hbs.AST.MustacheStatement
      if (mushStat.path.type == "PathExpression" && (mushStat.path as hbs.AST.PathExpression).original == "T") {
        items.push((mushStat.params[0] as hbs.AST.StringLiteral).value)
      }
    }
    if (stat.type === "BlockStatement") {
      const blockStat = stat as hbs.AST.BlockStatement
      if (blockStat.program) {
        items = items.concat(findInHbsProgramNode(blockStat.program))
      }
      if (blockStat.inverse) {
        items = items.concat(findInHbsProgramNode(blockStat.inverse))
      }
    }
  }
  return items
}

export function findInHbs(hbs: string) {
  const items = []

  const tree = handlebars.parse(hbs)
  return findInHbsProgramNode(tree)
}

export function findInTs(ts: string) {
  const js = typescript.transpileModule(ts, {
    compilerOptions: { module: typescript.ModuleKind.CommonJS }
  })
  return findInJs(js.outputText)
}

export function findInTsx(tsx: string) {
  const js = typescript.transpileModule(tsx, {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      jsx: typescript.JsxEmit.ReactJSX
    }
  })
  return findInJs(js.outputText)
}
