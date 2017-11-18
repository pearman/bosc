var rl = require('readline-sync');

const interpreter = require('./interpreter');
const tableUtils = require('./types/utils/tableUtils');

let prompt = require('prompt-sync')({
  history: require('prompt-sync-history')(),
  sigint: false
});

let scope = interpreter.newScope();
while (true) {
  let prog = prompt('pearscript$ ');
  if (prog === null) break;
  try {
    tableUtils.prettyPrint(interpreter.eval(prog, scope));
  } catch (err) {
    console.log(err);
  }
  //console.log(scope);
}
