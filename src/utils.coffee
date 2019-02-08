_ = require 'lodash'
xlsx = require('xlsx')

# Extracts localized strings from a plain object
exports.extractLocalizedStrings = (obj) ->
  if not obj?
    return []
    
  # Return self if string
  if obj._base?
    return [obj]

  strs = []

  # If array, concat each
  if _.isArray(obj)
    for item in obj
      strs = strs.concat(@extractLocalizedStrings(item))
  else if _.isObject(obj)
    for key, value of obj
      strs = strs.concat(@extractLocalizedStrings(value))

  return strs

# Keep unique base language string combinations
exports.dedupLocalizedStrings = (strs) ->
  out = []

  keys = {}
  for str in strs
    key = str._base + ":" + str[str._base]
    if keys[key]
      continue
    keys[key] = true
    out.push(str)
  return out

# Change the base locale for a set of localizations. 
# Works by making whatever the user sees as the toLocale base
exports.changeBaseLocale = (strs, fromLocale, toLocale) ->
  for str in strs
    # Get displayed 
    if str[fromLocale]
      displayed = str[fromLocale]
      delete str[fromLocale]
    else if str[str._base]
      displayed = str[str._base]
      delete str[str._base]

    if displayed
      str[toLocale] = displayed
      str._base = toLocale

  return

# Update a set of strings based on newly localized ones
exports.updateLocalizedStrings = (strs, updates) ->
  # Regularize CR/LF and trim
  regularize = (str) ->
    return str.replace(/\r/g, "").trim()

  # Map updates by key
  updateMap = {}
  for update in updates
    updateMap[update._base + ":" + regularize(update[update._base])] = update

  # Apply to each str
  for str in strs
    match = updateMap[str._base + ":" + regularize(str[str._base])]
    if match?
      for key, value of match
        if key != "_base" and key != str._base and key != "_unused" # Also ignore unused
          # Remove blank values 
          if value
            str[key] = regularize(value)
          else 
            delete str[key]

  return

# Exports localized strings for specified locales to XLSX file.
exports.exportXlsx = (locales, strs) ->
  wb = { SheetNames: [], Sheets: {} }
  
  range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }}
  ws = {}
  
  addCell = (row, column, value) ->
    
    # Update ranges
    if range.s.r > row then range.s.r = row
    if range.s.c > column then range.s.c = column
    if range.e.r < row then range.e.r = row
    if range.e.c < column then range.e.c = column
  
    # Create cell
    cell = { v: value, t: 's' }
    cell_ref = xlsx.utils.encode_cell({c:column,r:row})
    ws[cell_ref] = cell
    
  localeCount = 0
  addCell(0, localeCount++, "Original Language")
  
  if not _.findWhere(locales, { code: "en"})
    locales = locales.concat([{ code: "en", name: "English"}])

  # Add locale columns
  for locale in locales
    addCell(0, localeCount++ ,locale.name)

  # Add rows
  rows = 0
  for str in strs
    if str._unused
      continue

    base = _.findWhere(locales, { code: str._base })
    
    # Skip if unknown
    if not base
      continue

    columns = 0
    rows++

    addCell(rows, columns++, base.name)
    for locale in locales
      addCell(rows, columns++, str[locale.code] or "")
      
  # Encode range
  if range.s.c < 10000000
    ws['!ref'] = xlsx.utils.encode_range(range)
  
  # Add worksheet to workbook */
  wb.SheetNames.push("Translation")
  wb.Sheets["Translation"] = ws
  
  wbout = xlsx.write(wb, {bookType:'xlsx', bookSST:true, type: 'base64'})
  return wbout
      
_ = require 'lodash'
xlsx = require 'xlsx'

# Import from base64 xlsx file, returning localized strings
exports.importXlsx = (locales, xlsxFile) ->
  wb = xlsx.read(xlsxFile, {type: 'base64'})
  
  ws = wb.Sheets[wb.SheetNames[0]]
  
  # If English is not a locale, append it, as built-in form elements
  # are specified in English
  if not _.findWhere(locales, { code: "en"})
    locales = locales.concat([{ code: "en", name: "English"}])

  strs = []
  
  # Get the range of cells
  lastCell = ws["!ref"].split(":")[1]
  
  totalColumns = xlsx.utils.decode_cell(lastCell).c + 1
  totalRows = xlsx.utils.decode_cell(lastCell).r + 1
  
  # For each rows
  for i in [1...totalRows]
    # Get base locale
    base = _.findWhere(locales, { name: ws[xlsx.utils.encode_cell(c: 0, r: i)]?.v })
    # Skip if unknown
    if not base
      continue
      
    str = { _base: base.code }
      
    for col in [1...totalColumns]
      cell = ws[xlsx.utils.encode_cell(c: col, r: i)]
      
      if not cell
        continue
      
      val = cell.v

      # If value and not NaN, store in string
      if val? and val != "" and val == val
        # Convert to string
        val = String(val)
      else # Any invalid value is considered empty
        val = ""

      # Get locale of cell
      locale = _.findWhere(locales, { name: ws[xlsx.utils.encode_cell(c: col, r: 0)]?.v })
      if locale
        str[locale.code] = val
  
    # Ignore if base language blank
    if str[str._base]
      strs.push(str)
  
  return strs
