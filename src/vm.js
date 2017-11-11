const _ = require('lodash');
const Table = require('./types/table');
const tableUtils = require('./types/utils/tableUtils');
const argUtils = require('./types/utils/argUtils');
//const parser = require('./parser.js');

function resolve(table, ns) {
  return _.mapValues(table, val => {
    if (_.get(val, '_context') === 'execute') {
      return tableEval(val, ns);
    }
    return val;
  });
}

function tableEval(table, ns = [newLocal()]) {
  if (_.get(table, '_context') === 'root') {
    let index = 0;
    let curr;
    let retVal = null;
    while ((curr = table[index++])) {
      retVal = tableEval(curr, ns);
    }
    return retVal;
  }

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

  if (_.get(table, '_context') === 'executeFunction') {
    method = table[0];

    let fun = argUtils.symInNamespace(method, ns);

    index = 1;
    obj = { [method]: fun };
    args = [];
    argsExpected = fun.args;
    argsNum = tableUtils.arrLength(argsExpected);

    if (argsNum === 0) state = 3;
    else state = 2;
  }

  while ((curr = table[index++])) {
    //console.log(state, curr, retVal);
    if (state === 0) {
      if (_.isString(curr)) obj = argUtils.symInNamespace(curr, ns);
      else if (
        _.get(curr, '_context') === 'execute' ||
        _.get(curr, '_context') === 'executeFunction'
      )
        obj = tableEval(curr, ns);
      else if (_.get(curr, '_context') === 'resolve') obj = resolve(curr, ns);
      else obj = curr;
      //console.log('SET OBJ', obj);
      state = 1;
    } else if (state === 0.5 || state === 1) {
      if (state === 0.5) obj = retVal;
      method = curr;
      argsExpected = obj[curr].args;
      //console.log(obj);
      argsNum = tableUtils.arrLength(obj[curr].args);
      //console.log('ARGS EXPECTED', argsNum);
      args = [];
      if (argsNum === 0) state = 3;
      else state = 2;
    } else if (state === 2) {
      //console.log('Arg', curr);
      if (
        _.get(curr, '_context') === 'execute' ||
        _.get(curr, '_context') === 'executeFunction'
      )
        args.push(tableEval(curr, ns));
      else if (_.get(curr, '_context' === 'resolve'))
        args.push(resolve(curr, ns));
      else args.push(curr);

      if (args.length < argsNum) state = 2;
      else if (args.length === argsNum) state = 3;
    }

    if (state === 3) {
      //console.log(`Executing ${method} on `, obj);
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

// function pearscriptEval(str) {
//   let ast = parser.tryParse(str);
//   console.log(ast);
//   let local = newLocal();
//   return tableEval(ast, [local]);
// }

module.exports = { tableEval, newLocal };
