const _ = require('lodash');
const types = require('./types/types');
const tableUtils = require('./types/utils/tableUtils');
const argUtils = require('./types/utils/argUtils');
const parser = require('./parser/parser');

function eval(str, ns = [newLocal()]) {
  let output = parser.tryParse(str);
  return tableEval(output, ns);
}

function tableEval(table, ns = [newLocal()]) {
  let index = 0;
  let curr = null;

  let state = 0;
  let obj = null;
  let method = null;
  let argsExpected = [];
  let argsNum = 0;
  let args = [];
  let retVal = null;

  let resolvedInfixFunction = null;

  if (_.get(table, '_context') === 'executeFunction') {
    /**
     * Function special form ($(fun x y) special form)
     *  if the statement is a function
     *    set state and short circuit state machine to accepting args
     */
    method = table[0];

    let fun = argUtils.symInNamespace(method, ns);

    if (_.isNil(fun)) {
      throw {
        err: `Error: Function "${method}" does not exist!`,
        type: 'BoscError'
      };
    }

    index = 1;
    obj = { [method]: fun };
    args = [];
    argsExpected = fun.args;
    argsNum = tableUtils.arrLength(argsExpected);

    if (argsNum === 0) state = 3;
    else state = 2;
  }

  while ((curr = table[index++])) {
    if (state === 0) {
      /**
       * Consume object,
       *  if object is a symbol: lookup
       *  if object needs execution: execute
       *  if object needs resolution: resolve (map needs members to be executed, etc.)
       */
      if (_.isString(curr)) obj = argUtils.symInNamespace(curr, ns);
      else if (
        _.get(curr, '_context') === 'execute' ||
        _.get(curr, '_context') === 'executeFunction'
      )
        obj = tableEval(curr, ns);
      else if (_.get(curr, '_context') === 'resolve') obj = resolve(curr, ns);
      else obj = curr;

      if (_.isNil(obj)) {
        throw {
          err: `Error: Symbol "${curr}" does not exist!`,
          obj,
          type: 'BoscError'
        };
      }

      retVal = obj; // Useful for repl, when print value of var
      state = 1;
    } else if (state === 0.5 || state === 1) {
      /**
       * Consume method, check for number of arguments expected
       *  if no arguments expected: execute
       *  else consume next argument
       */
      if (state === 0.5) obj = retVal;
      method = curr;

      if (_.get(method, '_context') === 'infixFunction') {
        resolvedInfixFunction = tableEval(method, ns);
        if (!_.has(resolvedInfixFunction, 'args')) {
          throw {
            err: `Error: Not a valid infix method!`,
            method,
            type: 'BoscError'
          };
        }
        argsExpected = resolvedInfixFunction.args;
        argsNum = tableUtils.arrLength(argsExpected);
        args = [obj];
      } else {
        if (_.isNil(obj[curr])) {
          let methodName = method;
          let bonusInfo = '';
          if (_.isObject(methodName)) {
            methodName = '[Table]';
            bonusInfo = ', did you forget a comma?';
          }
          throw {
            err: `Error: Cannot find method "${methodName}"${bonusInfo}`,
            obj,
            type: 'BoscError'
          };
        }

        argsExpected = obj[curr].args;
        argsNum = tableUtils.arrLength(argsExpected);
        args = [];
      }
      if (argsNum === args.length) state = 3;
      else state = 2;
    } else if (state === 2) {
      /**
       * Consume argument,
       *  if argument needs execution: execute
       *  if argument needs resolution: resolve
       *  if argument is a symbol: lookup
       *  otherwise consume raw argument
       *
       *  if all args consumed: execute
       *  otherwise: consume next arg
       */
      if (
        (_.get(curr, '_context') === 'execute' ||
          _.get(curr, '_context') === 'executeFunction') &&
        !_.get(obj, [method, '_doNotEvalArgs'], false)
      )
        args.push(tableEval(curr, ns));
      else if (_.get(curr, '_context' === 'resolve'))
        args.push(resolve(curr, ns));
      else if (
        _.isString(curr) && // Strings are symbols
        !_.get(obj, [method, '_doNotResolveArgs'], false)
      )
        args.push(argUtils.resolveArg(curr, ns));
      else args.push(curr);

      if (args.length < argsNum) state = 2;
      else if (args.length === argsNum) state = 3;
    }

    // If all require args have been consumed, execute immediately
    if (state === 3) {
      /**
       * Execute method
       *  if it is a native method: call JS
       *  otherwise
       *    add args to scope and execute
       */
      let methodObj = _.isNull(resolvedInfixFunction)
        ? obj[method]
        : resolvedInfixFunction;
      if (methodObj._eval) {
        try {
          retVal = methodObj._eval(obj, args, ns, tableEval, types);
        } catch (err) {
          throw {
            err: `Error: Failed to execute JS method "${method}"\n`,
            jsErr: err,
            obj,
            type: 'BoscError'
          };
        }
      } else {
        let argObj = {};
        let index = 0;
        let arg = null;
        while ((arg = argsExpected[index++])) {
          argObj[arg] = args[index - 1];
        }
        argObj['this'] = obj;
        retVal = tableEval(methodObj, ns.concat([newLocal(argObj)]));
      }
      resolvedInfixFunction = null;
      state = 0.5;
    }
  }

  if (state === 2) {
    throw {
      err: `Error: Expecting another argument for method "${method}"`,
      obj,
      type: 'BoscError'
    };
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
