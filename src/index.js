const util = require('util');
const _ = require('lodash');

const parser = require('./parser.js');
const tableUtils = require('./tableUtils');
const pearscriptEval = require('./vm.js');

let text = `
(1 + 2 + 4)
`;

let ast = parser.tryParse(text);
let tableArray = ast.map(table => tableUtils.astToTable(table));
//tableUtils.prettyPrint(tableArray);

tableUtils.prettyPrint(pearscriptEval(tableArray));
