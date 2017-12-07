const _ = require('lodash');
const types = require('./types/types');
const tableUtils = require('./types/utils/tableUtils');
const argUtils = require('./types/utils/argUtils');
const parser = require('./parser/parser');
const errors = require('./errors/errors');

function eval(str, ns = [newLocal()]) {
  let output = parser.tryParse(str);
  return tableEval(output, ns);
}

function tableEval(table, ns = [newLocal()]) {
  let index = 0;
  let curr = null;

  let state = 0;
  let rootObj = null;
  let methodName = null;
  let methodObj = null;
  let argsExpected = [];
  let argsNum = 0;
  let args = [];
  let retVal = null;

  // If the statement is of the $() special form, short circuit
  // the interpreter to state 2 or 3
  if (_.get(table, '_context') === 'executeFunction') {
    methodName = table[0];
    methodObj = argUtils.symInNamespace(methodName, ns);

    if (_.isNil(methodObj)) errors.functionDoesNotExist(methodName);

    index = 1;
    rootObj = null;
    args = [];
    argsExpected = methodObj.args;
    argsNum = tableUtils.arrLength(argsExpected);

    if (argsNum === 0) state = 3;
    else state = 2;
  }

  while ((curr = table[index++])) {
    if (state === 0) {
      // Set root object

      // If symbol, find in namespace
      if (_.isString(curr)) rootObj = argUtils.symInNamespace(curr, ns);
      else if (
        _.get(curr, '_context') === 'execute' ||
        _.get(curr, '_context') === 'executeFunction'
      )
        // If execution is required -- execute
        rootObj = tableEval(curr, ns);
      else if (_.get(curr, '_context') === 'resolve')
        // If the data needs to be resolved -- resolve
        rootObj = resolve(curr, ns);
      else
        // Otherwise leave object alone
        rootObj = curr;

      if (_.isNil(rootObj)) errors.symbolDoesNotExist(rootObj, curr);

      retVal = rootObj; // Useful for repl, when print value of var
      state = 1;
    } else if (state === 0.5 || state === 1) {
      // Get method

      // If returning from successful method execution
      if (state === 0.5) rootObj = retVal;

      methodName = curr;

      if (_.get(methodName, '_context') === 'infixFunction') {
        // Function (infix)
        methodObj = tableEval(methodName, ns);

        if (!_.has(methodObj, 'args')) errors.notValidInfixMethod(methodName);

        argsExpected = methodObj.args;
        argsNum = tableUtils.arrLength(argsExpected);
        args = [rootObj];
      } else {
        // Method
        if (_.isNil(rootObj[methodName]))
          errors.cannotFindMethod(rootObj, methodName);

        methodObj = rootObj[methodName];
        argsExpected = methodObj.args;
        argsNum = tableUtils.arrLength(argsExpected);
        args = [];
      }

      if (argsNum === args.length) state = 3;
      else state = 2;
    } else if (state === 2) {
      // Consume arguments

      // If argument needs to be executed -- execute
      if (
        (_.get(curr, '_context') === 'execute' ||
          _.get(curr, '_context') === 'executeFunction') &&
        !_.get(rootObj, [methodName, '_doNotEvalArgs'], false)
      )
        args.push(tableEval(curr, ns));
      else if (_.get(curr, '_context' === 'resolve'))
        // If argument needs resolution -- resolve
        args.push(resolve(curr, ns));
      else if (
        _.isString(curr) && // Strings are symbols
        !_.get(rootObj, [methodName, '_doNotResolveArgs'], false)
      )
        // If argument is a symbol -- resolve if requested
        args.push(argUtils.resolveArg(curr, ns));
      else
        // Otherwise add argument
        args.push(curr);

      if (args.length < argsNum) state = 2;
      else if (args.length === argsNum) state = 3;
    }

    // If all require args have been consumed, execute immediately
    if (state === 3) {
      if (methodObj._eval) {
        // If native JS method
        try {
          retVal = methodObj._eval(rootObj, args, ns, tableEval, types);
        } catch (err) {
          errors.failedToExecuteJSMethod(rootObj, methodName, err);
        }
      } else {
        // If Bosc method
        let argObj = {};
        let index = 0;
        let arg = null;
        while ((arg = argsExpected[index++])) {
          argObj[arg] = args[index - 1];
        }
        argObj['this'] = rootObj;
        retVal = tableEval(methodObj, ns.concat([newLocal(argObj)]));
      }
      // Return to state 2, expecting another method
      state = 0.5;
    }
  }

  if (state === 2) {
    errors.expectingAnotherArgument(rootObj, methodName);
    return null;
  }

  return retVal;
}

function resolve(table, ns) {
  let result = _.mapValues(table, (val, key) => {
    if (_.get(val, '_context') === 'execute') {
      return tableEval(val, ns);
    }
    if (_.isString(val) && !_.startsWith('_', key)) {
      return argUtils.symInNamespace(val, ns);
    }
    if (_.get(val, '_context') === 'resolve') {
      return resolve(val, ns);
    }
    return val;
  });
  return new (types.Table())(undefined, result);
}

function newLocal(withData = {}) {
  let local = new types.Local(undefined, withData);
  local.local = local;
  return local;
}

function newScope() {
  return [newLocal()];
}

module.exports = { eval, tableEval, newLocal, newScope };
