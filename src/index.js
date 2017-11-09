const tableUtils = require('./tableUtils.js');
const parser = require('./parser.js');
const vm = require('./vm.js');

let prog = `
(local : list 
  (5 times |[x] 
    x print
    , x * 2|))
(list . 3 print)
`;

let output = parser.tryParse(prog);
//tableUtils.prettyPrint(output);

// Needs deep map execution, check every key for execute flag
