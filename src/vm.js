const _ = require('lodash');
const Mem = require('./mem.js');
const tableUtils = require('./tableUtils.js');

function symInScope(sym, memory) {
  for (let i = memory.length - 1; i >= 0; i--) {
    if (!_.isNil(memory[i][sym])) return memory[i][sym];
  }
  return null;
}

function tableEval(table, memory) {
  let index = 0;
  let curr = null;

  let state = 0;
  let obj = null; // State 0
  let method = null; // State 1
  let argsExpected = 0;
  let args = []; // State 2
  let retVal = null;
  while ((curr = table[index++])) {
    //console.log(state, curr, retVal);
    if (state === 0) {
      //if (_.isString(curr)) curr = symInScope(_.clone(curr), memory);
      obj = curr;
      state = 1;
    } else if (state === 0.5 || state === 1) {
      if (state === 0.5) obj = retVal;
      method = curr;
      argsExpected = tableUtils.arrLength(obj[curr].args);
      args = [];
      state = 2;
    } else if (state === 2) {
      if (_.get(curr, ['_context'], '') === 'execute')
        args.push(tableEval(curr));
      else args.push(curr);
      if (args.length < argsExpected) state = 2;
      else if (args.length === argsExpected) state = 3;
    }

    if (state === 3) {
      //tableUtils.prettyPrint(obj);
      //tableUtils.prettyPrint(args);
      if (obj[method]) {
        if (obj[method]._eval) {
          retVal = obj[method]._eval(obj, args, memory.concat([{}]));
        } else {
          retVal = tableEval(obj[method], memory.concat([{}]));
        }
        state = 0.5;
      }
      //tableUtils.prettyPrint(retVal);
    }
  }
  return retVal;
}

function pearscriptEval(data) {
  let memory = [{ mem: Mem }];
  return _.reduce(data, (acc, table) => tableEval(table, memory), null);
  console.log(memory);
}

module.exports = pearscriptEval;
