assert = require('chai').assert
stringExtractor = require '../src/extractor/stringExtractor'
coffeeify = require 'coffeeify'
hbsfy = require 'hbsfy'

describe "stringExtractor", ->
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


  describe "findFromRoot", ->
    it "finds in coffee and hbs", (done) ->
      stringExtractor.findFromRootFile __dirname + '/requireSample/a.js', { extensions: ['.js', '.coffee'], transform: [coffeeify, hbsfy] }, (strings) =>
        assert.deepEqual strings, ['b', 'c', 'd', 'a']
        done()
