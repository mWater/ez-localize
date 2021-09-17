import _ from 'lodash';
import xlsx from 'xlsx';

// Extracts localized strings from a plain object
export function extractLocalizedStrings(obj) {
  if ((obj == null)) {
    return [];
  }
    
  // Return self if string
  if (obj._base != null) {
    return [obj];
  }

  let strs = [];

  // If array, concat each
  if (_.isArray(obj)) {
    for (let item of obj) {
      strs = strs.concat(this.extractLocalizedStrings(item));
    }
  } else if (_.isObject(obj)) {
    for (let key in obj) {
      const value = obj[key];
      strs = strs.concat(this.extractLocalizedStrings(value));
    }
  }

  return strs;
}

// Keep unique base language string combinations
export function dedupLocalizedStrings(strs) {
  const out = [];

  const keys = {};
  for (let str of strs) {
    const key = str._base + ":" + str[str._base];
    if (keys[key]) {
      continue;
    }
    keys[key] = true;
    out.push(str);
  }
  return out;
}

// Change the base locale for a set of localizations. 
// Works by making whatever the user sees as the toLocale base
export function changeBaseLocale(strs, fromLocale, toLocale) {
  for (let str of strs) {
    // Get displayed 
    var displayed;
    if (str[fromLocale]) {
      displayed = str[fromLocale];
      delete str[fromLocale];
    } else if (str[str._base]) {
      displayed = str[str._base];
      delete str[str._base];
    }

    if (displayed) {
      str[toLocale] = displayed;
      str._base = toLocale;
    }
  }

}

// Update a set of strings based on newly localized ones
export function updateLocalizedStrings(strs, updates) {
  // Regularize CR/LF and trim
  const regularize = str => str.replace(/\r/g, "").trim();

  // Map updates by key
  const updateMap = {};
  for (let update of updates) {
    updateMap[update._base + ":" + regularize(update[update._base])] = update;
  }

  // Apply to each str
  for (let str of strs) {
    const match = updateMap[str._base + ":" + regularize(str[str._base])];
    if (match != null) {
      for (let key in match) {
        const value = match[key];
        if ((key !== "_base") && (key !== str._base) && (key !== "_unused")) { // Also ignore unused
          // Remove blank values 
          if (value) {
            str[key] = regularize(value);
          } else { 
            delete str[key];
          }
        }
      }
    }
  }

}

// Exports localized strings for specified locales to XLSX file.
export function exportXlsx(locales, strs) {
  let locale;
  const wb = { SheetNames: [], Sheets: {} };
  
  const range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
  const ws = {};
  
  const addCell = function(row, column, value) {
    
    // Update ranges
    if (range.s.r > row) { range.s.r = row; }
    if (range.s.c > column) { range.s.c = column; }
    if (range.e.r < row) { range.e.r = row; }
    if (range.e.c < column) { range.e.c = column; }
  
    // Create cell
    const cell = { v: value, t: 's' };
    const cell_ref = xlsx.utils.encode_cell({c:column,r:row});
    return ws[cell_ref] = cell;
  };
    
  let localeCount = 0;
  addCell(0, localeCount++, "Original Language");
  
  if (!_.findWhere(locales, { code: "en"})) {
    locales = locales.concat([{ code: "en", name: "English"}]);
  }

  // Add locale columns
  for (locale of locales) {
    addCell(0, localeCount++ ,locale.name);
  }

  // Add rows
  let rows = 0;
  for (let str of strs) {
    if (str._unused) {
      continue;
    }

    const base = _.findWhere(locales, { code: str._base });
    
    // Skip if unknown
    if (!base) {
      continue;
    }

    let columns = 0;
    rows++;

    addCell(rows, columns++, base.name);
    for (locale of locales) {
      addCell(rows, columns++, str[locale.code] || "");
    }
  }
      
  // Encode range
  if (range.s.c < 10000000) {
    ws['!ref'] = xlsx.utils.encode_range(range);
  }
  
  // Add worksheet to workbook */
  wb.SheetNames.push("Translation");
  wb.Sheets["Translation"] = ws;
  
  const wbout = xlsx.write(wb, {bookType:'xlsx', bookSST:true, type: 'base64'});
  return wbout;
}

_ = require('lodash');
xlsx = require('xlsx');

// Import from base64 xlsx file, returning localized strings
export function importXlsx(locales, xlsxFile) {
  const wb = xlsx.read(xlsxFile, {type: 'base64'});
  
  const ws = wb.Sheets[wb.SheetNames[0]];
  
  // If English is not a locale, append it, as built-in form elements
  // are specified in English
  if (!_.findWhere(locales, { code: "en"})) {
    locales = locales.concat([{ code: "en", name: "English"}]);
  }

  const strs = [];
  
  // Get the range of cells
  const lastCell = ws["!ref"].split(":")[1];
  
  const totalColumns = xlsx.utils.decode_cell(lastCell).c + 1;
  const totalRows = xlsx.utils.decode_cell(lastCell).r + 1;
  
  // For each rows
  for (let i = 1, end = totalRows, asc = 1 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
    // Get base locale
    const base = _.findWhere(locales, { name: ws[xlsx.utils.encode_cell({c: 0, r: i})]?.v });
    // Skip if unknown
    if (!base) {
      continue;
    }
      
    const str = { _base: base.code };
      
    for (let col = 1, end1 = totalColumns, asc1 = 1 <= end1; asc1 ? col < end1 : col > end1; asc1 ? col++ : col--) {
      const cell = ws[xlsx.utils.encode_cell({c: col, r: i})];
      
      if (!cell) {
        continue;
      }
      
      let val = cell.v;

      // If value and not NaN, store in string
      if ((val != null) && (val !== "") && (val === val)) {
        // Convert to string
        val = String(val);
      } else { // Any invalid value is considered empty
        val = "";
      }

      // Get locale of cell
      const locale = _.findWhere(locales, { name: ws[xlsx.utils.encode_cell({c: col, r: 0})]?.v });
      if (locale) {
        str[locale.code] = val;
      }
    }
  
    // Ignore if base language blank
    if (str[str._base]) {
      strs.push(str);
    }
  }
  
  return strs;
}
