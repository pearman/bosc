const tableUtils = require('./types/utils/tableUtils.js');
const parser = require('./parser/parser.js');
const vm = require('./vm.js');

let prog = `
(local : list 
  (5 times |[x] 
    x print
    , x * 2|))
(list . 3 print)
(4 + 4 / 2 * 3 print)
`;

let output = parser.tryParse(prog);
//tableUtils.prettyPrint(output);

// Needs deep map execution, check every key for execute flag
