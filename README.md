# ez-localize

Localizing an application should be easy, not hard. ez-localize makes it ridiculously simple.

## Usage

### Step 1: Use T() to wrap strings

Just replace:

``` 
console.log("Hello world!");
```

With:

```
console.log(T("Hello world!"));
```

### Step 2: Extract strings from your application

```
var extractor = require('ez-localize/extractor');

extractor.updateLocalizationFile("index.js", "localizations.json", {}, function() { console.log("done!")})
```

### Step 3: Create a localizer and make global

```
var ezlocalize = require('ez-localize');
var localizations = require('localizations.json');

var localizer = new ezlocalize.Localizer(localizations, "en")
localizer.makeGlobal();

```

### Step 4: Edit localizations.json to add other languages and translations

_You're done!_


## Advanced

String substitution:

```
console.log(T("This works {0}%!", 100);
```

React-style substitution:

```
console.log(T("This works {0}%!", { x: 10 });
```

will create array of ["This works ", { x: 10 }, "%!"]


It handles Handlebars too:

```
var options = { extensions: ['.js'], transform: [hbsfy] };
extractor.updateLocalizationsupdateLocalizationFile("index.js", "localizations.json", options, function() { console.log("done!")})
```

To register a T helper:

```
var ezlocalize = require('ez-localize');
var handlebars = require("hbsfy/runtime");
var localizations = require('localizations.json');

var localizer = new ezlocalize.Localizer(localizations, "en")
localizer.makeGlobal(handlebars);
```

Only relative requires are included by default. To include another module, pass `externalModules` to options, an optional list of external modules to include

## Localizing a JSON object

To localize the strings inside a JSON object (plain javascript object), use require('ez-localize/lib/JsonLocalizer`)