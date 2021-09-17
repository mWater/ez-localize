import minimist from 'minimist';
import importer from './src/importer';

// Process args
const args = minimist(process.argv.slice(2));

if (!args._.length > 0) {
  console.log("Usage: <XLSX file input> <JSON file input> [<JSON file output>]");
  return; 
}

const dataFile = args._[0];
const xlsxFile = args._[1];
let newDataFile = args._[2];

if ((newDataFile == null)) {
  newDataFile = dataFile;
}

importer(dataFile, xlsxFile, newDataFile, () => console.log('Done Importing'));
