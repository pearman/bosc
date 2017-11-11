const tableUtils = require('./types/utils/tableUtils');
const parser = require('./parser/parser');
const vm = require('./vm');

let prog = `
(local : fun |[x] x + 1 print|)
(3 + $(fun 5) print)
`;

let output = parser.tryParse(prog);
//tableUtils.prettyPrint(output);
vm.tableEval(output);
