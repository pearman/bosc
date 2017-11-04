const _ = require('lodash');
const Table = require('./types/table.js');
const tableUtils = require('./tableUtils.js');
const argUtils = require('./argUtils.js');
const parser = require('./parser.js');
const astUtils = require('./astUtils');

function tableEval(table, ns) {
  //console.log('TABLE EVAL ------');
  let index = 0;
  let curr = null;

  let state = 0;
  let obj = null;
  let method = null;
  let argsExpected = [];
  let argsNum = 0;
  let args = [];
  let retVal = null;
  while ((curr = table[index++])) {
    //console.log(state, curr, retVal);
    if (state === 0) {
      if (_.isString(curr)) obj = argUtils.symInNamespace(curr, ns);
      else if (_.get(curr, ['_context']) === 'execute')
        obj = tableEval(curr, ns);
      else obj = curr;
      //console.log('SET OBJ', obj);
      state = 1;
    } else if (state === 0.5 || state === 1) {
      if (state === 0.5) obj = retVal;
      method = curr;
      argsExpected = obj[curr].args;
      argsNum = tableUtils.arrLength(obj[curr].args);
      //console.log('ARGS EXPECTED', argsNum);
      args = [];
      if (argsNum === 0) state = 3;
      else state = 2;
    } else if (state === 2) {
      if (_.get(curr, ['_context'], '') === 'execute')
        args.push(tableEval(curr, ns));
      else args.push(curr);

      if (args.length < argsNum) state = 2;
      else if (args.length === argsNum) state = 3;
    }

    if (state === 3) {
      //console.log(`Executing ${method} on ${JSON.stringify(obj)}`);
      //tableUtils.prettyPrint(obj);
      //tableUtils.prettyPrint(args);
      if (obj[method]) {
        if (obj[method]._eval) {
          retVal = obj[method]._eval(obj, args, ns, tableEval);
        } else {
          let argObj = {};
          let index = 0;
          let arg = null;
          while ((arg = argsExpected[index++])) {
            argObj[arg] = args[index - 1];
          }
          //console.log(argObj);
          retVal = tableEval(obj[method], ns.concat([newLocal(argObj)]));
        }
        state = 0.5;
      }
      //tableUtils.prettyPrint(retVal);
    }
  }

  return retVal;
}

function newLocal(withData = {}) {
  let local = _.merge({}, Table, withData);
  local.local = local;
  return local;
}

function pearscriptEval(str) {
  let ast = parser.tryParse(str);
  let data = ast.map(table => astUtils.astToTable(table));
  let local = newLocal();
  return _.reduce(data, (acc, table) => tableEval(table, [local]), null);
}

module.exports = { eval: pearscriptEval };
