"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findInTsx = exports.findInTs = exports.findInHbs = exports.findInJs = exports.findFromRootDirs = void 0;
const fs_1 = __importDefault(require("fs"));
const glob_1 = __importDefault(require("glob"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
const acorn = __importStar(require("acorn"));
const walk = __importStar(require("acorn-walk"));
const typescript_1 = __importDefault(require("typescript"));
// rootDirs are the directories to find files in. node_modules is never entered. Can be files as well, in which case the file is used
// callback is called with list of strings
function findFromRootDirs(rootDirs, callback) {
    let strings = [];
    for (let rootDir of rootDirs) {
        var filenames;
        if (fs_1.default.lstatSync(rootDir).isDirectory()) {
            filenames = glob_1.default.sync("**/*.@(js|tsx|ts|hbs)", { cwd: rootDir });
        }
        else {
            filenames = ["."];
        }
        for (let filename of filenames) {
            // Skip node_modules
            var fullFilename;
            if (filename.match(/node_modules/)) {
                continue;
            }
            if (filename !== ".") {
                fullFilename = path_1.default.resolve(rootDir, filename);
            }
            else {
                fullFilename = path_1.default.resolve(rootDir);
            }
            console.log(fullFilename);
            const contents = fs_1.default.readFileSync(fullFilename, "utf-8");
            const ext = path_1.default.extname(fullFilename);
            switch (ext) {
                case ".js":
                    strings = strings.concat(findInJs(contents));
                    break;
                case ".hbs":
                    strings = strings.concat(findInHbs(contents));
                    break;
                case ".ts":
                    strings = strings.concat(findInTs(contents));
                    break;
                case ".tsx":
                    strings = strings.concat(findInTsx(contents));
                    break;
            }
        }
    }
    callback(strings);
}
exports.findFromRootDirs = findFromRootDirs;
function findInJs(js) {
    const items = [];
    walk.simple(acorn.parse(js, { ecmaVersion: "latest" }), {
        CallExpression: function (node) {
            var _a, _b, _c, _d, _e, _f, _g;
            if (((_a = node.callee) === null || _a === void 0 ? void 0 : _a.name) === "T" && typeof ((_b = node.arguments[0]) === null || _b === void 0 ? void 0 : _b.value) === "string") {
                items.push((_c = node.arguments[0]) === null || _c === void 0 ? void 0 : _c.value);
            }
            else if (((_e = (_d = node.callee) === null || _d === void 0 ? void 0 : _d.property) === null || _e === void 0 ? void 0 : _e.name) === "T" && typeof ((_f = node.arguments[0]) === null || _f === void 0 ? void 0 : _f.value) === "string") {
                items.push((_g = node.arguments[0]) === null || _g === void 0 ? void 0 : _g.value);
            }
        },
        TaggedTemplateExpression: function (node) {
            if (node.tag.type == "Identifier" && node.tag.name == "T") {
                let str = "";
                for (let i = 0; i < node.quasi.quasis.length; i++) {
                    if (i > 0) {
                        str += `{${i - 1}}`;
                    }
                    str += node.quasi.quasis[i].value.raw;
                }
                items.push(str);
            }
        },
    });
    return items;
}
exports.findInJs = findInJs;
function findInHbsProgramNode(node) {
    let items = [];
    for (let stat of node.body) {
        if (stat.type === "MustacheStatement") {
            const mushStat = stat;
            if (mushStat.path.type == "PathExpression" && mushStat.path.original == "T") {
                items.push(mushStat.params[0].value);
            }
        }
        if (stat.type === "BlockStatement") {
            const blockStat = stat;
            if (blockStat.program) {
                items = items.concat(findInHbsProgramNode(blockStat.program));
            }
            if (blockStat.inverse) {
                items = items.concat(findInHbsProgramNode(blockStat.inverse));
            }
        }
    }
    return items;
}
function findInHbs(hbs) {
    const items = [];
    const tree = handlebars_1.default.parse(hbs);
    return findInHbsProgramNode(tree);
}
exports.findInHbs = findInHbs;
function findInTs(ts) {
    const js = typescript_1.default.transpileModule(ts, {
        compilerOptions: { module: typescript_1.default.ModuleKind.CommonJS }
    });
    return findInJs(js.outputText);
}
exports.findInTs = findInTs;
function findInTsx(tsx) {
    const js = typescript_1.default.transpileModule(tsx, {
        compilerOptions: {
            module: typescript_1.default.ModuleKind.CommonJS,
            jsx: typescript_1.default.JsxEmit.ReactJSX
        }
    });
    return findInJs(js.outputText);
}
exports.findInTsx = findInTsx;
