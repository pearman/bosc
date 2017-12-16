#!/usr/bin/env node
const fs = require('fs');
const interpreter = require('./interpreter.1');
const tableUtils = require('./types/utils/tableUtils');

const chalk = require('chalk');
const inquirer = require('inquirer');
inquirer.registerPrompt('command', require('./prompt/command.js'));

// let done = false;
// async function test() {
//   let result = await interpreter.eval(`2 + 2`);
//   console.log(result);
// }

// test().catch(err => console.log(err));

async function repl() {
  let scope = interpreter.newScope();
  while (1) {
    await inquirer
      .prompt([
        {
          type: 'command',
          name: 'prog',
          message: '$',
          prefix: chalk.green.bold('bosc'),
          context: 0
        }
      ])
      .then(async result => {
        return interpreter
          .eval(result.prog, scope)
          .map(out => tableUtils.prettyPrint(out))
          .toPromise();
      })
      .catch(err => {
        console.error(err);
      });
  }
}

let argv = require('minimist')(process.argv.slice(2));
if (argv['_'].length > 0) {
  fs.readFile(argv['_'][0], 'utf8', (err, prog) => {
    if (err) console.log(err);
    else {
      try {
        interpreter.eval(prog).subscribe();
      } catch (err) {
        console.log(err);
      }
    }
  });
} else repl();
