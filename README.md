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

var localizer = new ezlocalize.Localizer(require('localizations.json'), "en")
localizer.makeGlobal();

```

### Step 4: Edit localizations.json to add other languages and translations

**That's it**


