"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

// Localizer is a function that sets up global variable "T" which is 
// used to translate strings. Also sets up Handlebars helper with same name
// Function "T" maps to Localizer "localizeString" function
// Helper "T" maps to Localizer "localizeString" function
var Localizer;

module.exports = Localizer = /*#__PURE__*/function () {
  function Localizer(data) {
    var locale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "en";
    (0, _classCallCheck2["default"])(this, Localizer);
    var j, len, ref, str;
    this.T = this.T.bind(this);
    this.localizeString = this.localizeString.bind(this); // Localizes a plain string without React-style interpretation. Needed for handlebars as it passes extra arguments

    this.localizePlainString = this.localizePlainString.bind(this); // Determines if a string is localized

    this.isLocalized = this.isLocalized.bind(this);
    this.data = data;
    this.locale = locale; // Index strings by English if data present

    this.englishMap = {};

    if (data != null) {
      ref = this.data.strings;

      for (j = 0, len = ref.length; j < len; j++) {
        str = ref[j];
        this.englishMap[str.en] = str;
      }
    }
  }

  (0, _createClass2["default"])(Localizer, [{
    key: "setLocale",
    value: function setLocale(code) {
      return this.locale = code;
    }
  }, {
    key: "getLocales",
    value: function getLocales() {
      return this.data.locales;
    }
  }, {
    key: "T",
    value: function T(str) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return this.localizeString.apply(this, arguments);
    }
  }, {
    key: "localizeString",
    value: function localizeString(str) {
      var arg, hasObject, item, j, k, len, len1, locstr, output, part, parts; // Null is just pass-through

      if (str == null) {
        return str;
      } // True if object passed in as arg (react style)


      hasObject = false;

      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      for (j = 0, len = args.length; j < len; j++) {
        arg = args[j];

        if (arg && (0, _typeof2["default"])(arg) === "object") {
          hasObject = true;
        }
      }

      if (!hasObject) {
        return this.localizePlainString.apply(this, [str].concat(args));
      } else {
        // Find string, falling back to English
        item = this.englishMap[str];

        if (item && item[this.locale]) {
          locstr = item[this.locale];
        } else {
          locstr = str;
        } // Split and do react-style replacement where string is made into array


        parts = locstr.split(/(\{\d+\})/);
        output = [];

        for (k = 0, len1 = parts.length; k < len1; k++) {
          part = parts[k];

          if (part.match(/^\{\d+\}$/)) {
            output.push(args[parseInt(part.substr(1, part.length - 2))]);
          } else {
            output.push(part);
          }
        }

        return output;
      }
    }
  }, {
    key: "localizePlainString",
    value: function localizePlainString(str) {
      var i, item, j, locstr, ref; // Find string, falling back to English

      item = this.englishMap[str];

      if (item && item[this.locale]) {
        locstr = item[this.locale];
      } else {
        locstr = str;
      } // Fill in arguments


      for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      for (i = j = 0, ref = args.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        locstr = locstr.replace("{" + i + "}", args[i]);
      }

      return locstr;
    }
  }, {
    key: "isLocalized",
    value: function isLocalized(str) {
      return str && this.englishMap[str] && this.englishMap[str][this.locale];
    } // Makes this localizer global. handlebars is instance to register
    // helper on, null for none

  }, {
    key: "makeGlobal",
    value: function makeGlobal(handlebars) {
      global.T = this.localizeString;
      global.T.localizer = this;

      if (handlebars != null) {
        return handlebars.registerHelper('T', this.localizePlainString);
      }
    }
  }]);
  return Localizer;
}();