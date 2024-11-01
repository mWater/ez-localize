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

Or use ES6 tagged templates:

```
console.log(T`Hello world!')
```

Or use localization requests with an explicit locale:

```
console.log(T({ locale: "fr", text: "dog" }));
console.log(T({ locale: "fr", text: "{0}'s dog", args: ["Dave"] }));
console.log(T({ locale: "fr", text: { _base: "en", en: "cat", fr: "chat" }}));
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


```
console.log(T`This works ${100}%!`);
```


React-style substitution:

```
console.log(T("This works {0}%!", { x: 10 });
```

will create array of ["This works ", { x: 10 }, "%!"]


Sometimes a word like "open" is ambiguous. You can specify the context to disambiguate:

```
console.log(T("open|verb"));
```

This will render as "open" in English and whatever the translation of "open|verb" is in the requested language.


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
