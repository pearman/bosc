const tableUtils = require('./types/utils/tableUtils');
const parser = require('./parser/parser');
const vm = require('./vm');

let prog = `
(local : fun |[x]
  x print ,
  x < 5 ? 
    $(fun (x + 1))
    x
|)
$(fun -5)
([1 2 3 4] map |[x] x + 1| aPrint)
`;

let output = parser.tryParse(prog);
tableUtils.prettyPrint(output);
vm.tableEval(output);
