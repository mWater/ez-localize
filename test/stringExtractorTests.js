import { assert } from 'chai';
import stringExtractor from '../src/extractor/stringExtractor';
import coffeeify from 'coffeeify';
import hbsfy from 'hbsfy';

describe("stringExtractor", function() {
  this.timeout(20000);
  describe("findInJs", function() {
    it("finds strings", function() {
      const code = `\
var func = function() {
  var x = 5;
  console.log(T("test1"));
  console.log(T('test2'));
  console.log(T('test"quote'));
  console.log(T("test\\"quote2"));
}\
`;
      return assert.deepEqual(stringExtractor.findInJs(code), 
        ['test1', 'test2', 'test"quote', 'test"quote2']);
  });

    it("ignores non-strings", function() {
      const code = `\
var func = function() {
  var x = 5;
  console.log(T(3));
  console.log(T(x));
  console.log(T("test"));
}\
`;
      return assert.deepEqual(stringExtractor.findInJs(code), 
        ['test']);
  });

    return it("finds T calls on objects", function() {
      const code = `\
var func = function() {
  var ctx = {};
  var obj = {};
  console.log(ctx.T("test1"));
  console.log(obj.ctx.T("test2"));
  console.log(this.ctx.T("test3"));
}\
`;
      return assert.deepEqual(stringExtractor.findInJs(code), 
        ['test1', 'test2', 'test3']);
  });
});

  describe("findInCoffee", function() {
    it("finds strings", function() {
      const code = `\
$ ->
  x = 5
  console.log T("test1")
  console.log T('test2')
  console.log T('test"quote')
  console.log T("test\\"quote2")\
`;
      return assert.deepEqual(stringExtractor.findInCoffee(code), 
        ['test1', 'test2', 'test"quote', 'test"quote2']);
  });

    return it("finds multiline strings", function() {
      const code = "x = T('''somestring\nanotherline''')";
      return assert.deepEqual(stringExtractor.findInCoffee(code), 
        ['somestring\nanotherline']);
  });
});

  describe("findInHbs", function() {
    it("finds strings", function() {
      const code = `\
{{T 'some string'}}
T 'not this'
{{T "another string"}}\
`;
      return assert.deepEqual(stringExtractor.findInHbs(code), 
        ['some string', 'another string']);
  });

    it("finds strings in clauses", function() {
      const code = `\
{{#if x}}
  {{T 'some string'}}
  {{#each y}}
    {{T "another string"}}
  {{/each}}
{{/if}}\
`;
      return assert.deepEqual(stringExtractor.findInHbs(code), 
        ['some string', 'another string']);
  });

    it("allows empty clauses", function() {
      const code = `\
{{#if x}}{{/if}}
{{#each y}}{{/each}}\
`;
      return assert.deepEqual(stringExtractor.findInHbs(code), 
        []);
  });

    return it("finds strings in else clauses", function() {
      const code = `\
{{#if x}}
  {{T 'some string'}}
{{else}}
  {{T "another string"}}
{{/if}}\
`;
      return assert.deepEqual(stringExtractor.findInHbs(code), 
        ['some string', 'another string']);
  });
});

  describe("findInTs", function() {
    it("finds strings", function() {
      const code = `\
export default function(x: any) {
  window.T("SDFSDF")
  return x
}\
`;
      return assert.deepEqual(stringExtractor.findInTs(code), 
        ['SDFSDF']);
  });
  
    return it("finds strings in tsx", function() {
      const code = `\
class Chip extends React.Component<any, any> {
  render() {
    return (
      <div className="chip">{T("SDFSDF")}</div>
    );
  }
}\
`;
      return assert.deepEqual(stringExtractor.findInTsx(code), 
        ['SDFSDF']);
  });
});

  return describe("findFromRoot", () => it("finds in coffee and hbs", done => stringExtractor.findFromRootDirs([__dirname + '/requireSample'], strings => {
    assert.deepEqual(strings.sort(), ['a', 'b', 'c', 'd']);
    return done();
  })));
});