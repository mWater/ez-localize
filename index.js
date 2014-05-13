exports.Localizer = require('./lib/Localizer');

// Create default localizer
var defaultLocalizer = new exports.Localizer();

// Create a default T that does nothing
exports.defaultT = defaultLocalizer.T;