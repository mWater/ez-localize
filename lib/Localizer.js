var Localizer,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __slice = [].slice;

module.exports = Localizer = (function() {
  function Localizer(data, locale) {
    var str, _i, _len, _ref;
    if (locale == null) {
      locale = "en";
    }
    this.isLocalized = __bind(this.isLocalized, this);
    this.localizePlainString = __bind(this.localizePlainString, this);
    this.localizeString = __bind(this.localizeString, this);
    this.T = __bind(this.T, this);
    this.data = data;
    this.locale = locale;
    this.englishMap = {};
    if (data != null) {
      _ref = this.data.strings;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        str = _ref[_i];
        this.englishMap[str.en] = str;
      }
    }
  }

  Localizer.prototype.setLocale = function(code) {
    return this.locale = code;
  };

  Localizer.prototype.getLocales = function() {
    return this.data.locales;
  };

  Localizer.prototype.T = function() {
    var args, str;
    str = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return this.localizeString.apply(this, arguments);
  };

  Localizer.prototype.localizeString = function() {
    var arg, args, hasObject, item, locstr, output, part, parts, str, _i, _j, _len, _len1;
    str = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (str == null) {
      return str;
    }
    hasObject = false;
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      arg = args[_i];
      if (arg && typeof arg === "object") {
        hasObject = true;
      }
    }
    if (!hasObject) {
      return this.localizePlainString.apply(this, [str].concat(__slice.call(args)));
    } else {
      item = this.englishMap[str];
      if (item && item[this.locale]) {
        locstr = item[this.locale];
      } else {
        locstr = str;
      }
      parts = locstr.split(/(\{\d+\})/);
      output = [];
      for (_j = 0, _len1 = parts.length; _j < _len1; _j++) {
        part = parts[_j];
        if (part.match(/^\{\d+\}$/)) {
          output.push(args[parseInt(part.substr(1, part.length - 2))]);
        } else {
          output.push(part);
        }
      }
      return output;
    }
  };

  Localizer.prototype.localizePlainString = function() {
    var args, i, item, locstr, str, _i, _ref;
    str = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    item = this.englishMap[str];
    if (item && item[this.locale]) {
      locstr = item[this.locale];
    } else {
      locstr = str;
    }
    for (i = _i = 0, _ref = args.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      locstr = locstr.replace("{" + i + "}", args[i]);
    }
    return locstr;
  };

  Localizer.prototype.isLocalized = function(str) {
    return str && this.englishMap[str] && this.englishMap[str][this.locale];
  };

  Localizer.prototype.makeGlobal = function(handlebars) {
    global.T = this.localizeString;
    global.T.localizer = this;
    if (handlebars != null) {
      return handlebars.registerHelper('T', this.localizePlainString);
    }
  };

  return Localizer;

})();
