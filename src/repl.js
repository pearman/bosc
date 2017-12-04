#!/usr/bin/env node
const fs = require('fs');
const interpreter = require('./interpreter');
const tableUtils = require('./types/utils/tableUtils');

let prompt = require('prompt-sync')({
  history: require('prompt-sync-history')(),
  sigint: false
});

function repl() {
  let scope = interpreter.newScope();
  while (true) {
    let prog = prompt('bosc$ ');
    if (prog === null) break;
    try {
      tableUtils.prettyPrint(interpreter.eval(prog, scope));
    } catch (err) {
      console.log(err);
    }
  }
}

let argv = require('minimist')(process.argv.slice(2));
if (argv['_'].length > 0) {
  fs.readFile(argv['_'][0], 'utf8', (err, prog) => {
    if (err) console.log(err);
    else {
      try {
        interpreter.eval(prog);
      } catch (err) {
        console.log(err);
      }
    }
  });
} else repl();
