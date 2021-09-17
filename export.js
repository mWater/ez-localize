// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import minimist from 'minimist';
import exporter from './src/exporter';

// Process args
const args = minimist(process.argv.slice(2));

if (!args._.length > 0) {
  console.log("Usage: <JSON file input> <XLSX file output>");
  return; 
}

const dataFile = args._[0];
const xlsxFile = args._[1];

exporter(dataFile, xlsxFile);
console.log(`Export complete to ${xlsxFile}`);
