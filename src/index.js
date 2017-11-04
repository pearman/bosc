const tableUtils = require('./tableUtils.js');
const vm = require('./vm.js');

let prog = `
(local : bob { name 'Larry' age 6 })
(bob . name + ' is ' + (18 - (bob . age)) + ' years from 18 years old' print)
`;

let output = vm.eval(prog);
//tableUtils.prettyPrint(output);
