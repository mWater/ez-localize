assert = require('chai').assert
stringExtractor = require '../src/extractor/stringExtractor'
coffeeify = require 'coffeeify'
hbsfy = require 'hbsfy'

describe "stringExtractor", ->
  @timeout(20000)
  describe "findInJs", ->
    it "finds strings", ->
      code = '''
        var func = function() {
          var x = 5;
          console.log(T("test1"));
          console.log(T('test2'));
          console.log(T('test"quote'));
          console.log(T("test\\"quote2"));
        }
      '''
      assert.deepEqual stringExtractor.findInJs(code), 
        ['test1', 'test2', 'test"quote', 'test"quote2']

    it "ignores non-strings", ->
      code = '''
        var func = function() {
          var x = 5;
          console.log(T(3));
          console.log(T(x));
          console.log(T("test"));
        }
      '''
      assert.deepEqual stringExtractor.findInJs(code), 
        ['test']

    it "finds T calls on objects", ->
      code = '''
        var func = function() {
          var ctx = {};
          var obj = {};
          console.log(ctx.T("test1"));
          console.log(obj.ctx.T("test2"));
          console.log(this.ctx.T("test3"));
        }
      '''
      assert.deepEqual stringExtractor.findInJs(code), 
        ['test1', 'test2', 'test3']

  describe "findInCoffee", ->
    it "finds strings", ->
      code = '''
$ ->
  x = 5
  console.log T("test1")
  console.log T('test2')
  console.log T('test"quote')
  console.log T("test\\"quote2")
      '''
      assert.deepEqual stringExtractor.findInCoffee(code), 
        ['test1', 'test2', 'test"quote', 'test"quote2']

    it "finds multiline strings", ->
      code = "x = T('''somestring\nanotherline''')"
      assert.deepEqual stringExtractor.findInCoffee(code), 
        ['somestring\nanotherline']

  describe "findInHbs", ->
    it "finds strings", ->
      code = '''
        {{T 'some string'}}
        T 'not this'
        {{T "another string"}}
      '''
      assert.deepEqual stringExtractor.findInHbs(code), 
        ['some string', 'another string']

    it "finds strings in clauses", ->
      code = '''
        {{#if x}}
          {{T 'some string'}}
          {{#each y}}
            {{T "another string"}}
          {{/each}}
        {{/if}}
      '''
      assert.deepEqual stringExtractor.findInHbs(code), 
        ['some string', 'another string']

    it "allows empty clauses", ->
      code = '''
        {{#if x}}{{/if}}
        {{#each y}}{{/each}}
      '''
      assert.deepEqual stringExtractor.findInHbs(code), 
        []

    it "finds strings in else clauses", ->
      code = '''
        {{#if x}}
          {{T 'some string'}}
        {{else}}
          {{T "another string"}}
        {{/if}}
      '''
      assert.deepEqual stringExtractor.findInHbs(code), 
        ['some string', 'another string']

  describe "findInTs", ->
    it "finds strings", ->
      code = '''
export default function(x: any) {
  window.T("SDFSDF")
  return x
}
      '''
      assert.deepEqual stringExtractor.findInTs(code), 
        ['SDFSDF']
  
    it "finds strings in tsx", ->
      code = '''
class Chip extends React.Component<any, any> {
  render() {
    return (
      <div className="chip">{T("SDFSDF")}</div>
    );
  }
}
      '''
      assert.deepEqual stringExtractor.findInTsx(code), 
        ['SDFSDF']

  describe "findFromRoot", ->
    it "finds in coffee and hbs", (done) ->
      stringExtractor.findFromRootDirs [__dirname + '/requireSample'], (strings) =>
        assert.deepEqual strings.sort(), ['a', 'b', 'c', 'd']
        done()