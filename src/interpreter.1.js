const _ = require('lodash');
const rx = require('rxjs');

const types = require('./types/types');
const tableUtils = require('./types/utils/tableUtils');
const argUtils = require('./types/utils/argUtils');
const parser = require('./parser/parser');
const errors = require('./errors/errors');

function eval(str, ns = [newLocal()]) {
  let output = parser.tryParse(str);
  console.log(output);
  return tableEval(output, ns).toPromise();
}

function tableEval(table, ns = [newLocal()]) {
  let tArr = tableUtils.toArray(table);
  if (table._context === 'executeFunction') {
    return handleContext(tArr.shift(), ns, undefined, true)
      .map(method => ({ root: {}, method }))
      .mergeMap(statement =>
        rx.Observable.forkJoin(
          ..._.map(tArr, arg => handleContext(arg, ns, statement))
        ).map(args => _.assign(statement, { args }))
      )
      .mergeMap(statement => runStatement(statement, ns));
  } else {
    return rx.Observable.from(tArr)
        .mergeScan((acc, val) => {
          return buildStatement(val, acc, ns);
        })
        .take(tArr.length)
        .map(result => result.root);
  }
}

function buildStatement(value, lastStatement = {}, ns = [newLocal()]) {
  return (
    rx.Observable.of({
      value
    })
      //.do(data => console.log('token', data))
      .mergeMap(({ value }) => handleContext(value, ns, lastStatement))
      //.do(data => console.log('resolved', data))
      .map(value => {
        let acc = lastStatement;
        if (!acc.args) acc.args = [];
        if (!acc.root) {
          acc.root = value;
        } else if (!acc.method) {
          acc.method = value;
        } else if (acc.args.length < tableUtils.arrLength(acc.method.args)) {
          acc.args.push(value);
        }
        return acc;
      })
      .mergeMap(statement => {
        console.log(statement);
        if (
          statement.root &&
          statement.method &&
          statement.args &&
          statement.args.length === tableUtils.arrLength(statement.method.args)
        ) {
          return runStatement(statement, ns).map(result => ({ root: result }));
        } else {
          return rx.Observable.of(statement);
        }
      })
  );
}

function handleContext(table, ns, lastStatement, getMethodFromLocal = false) {
  console.log('handling context of', table);
  if (table instanceof rx.Observable) return table;
  return rx.Observable.of(table).mergeMap(table => {
    if (_.isString(table)) {
      if (
        lastStatement &&
        lastStatement.root &&
        !lastStatement.method &&
        !getMethodFromLocal
      ) {
        return rx.Observable.of(lastStatement.root[table]);
      } else {
        return rx.Observable.of(argUtils.symInNamespace(table, ns));
      }
    } else if (
      _.get(table, '_context') === 'execute' ||
      _.get(table, '_context') === 'executeFunction'
    ) {
      // If execution is required -- execute
      return tableEval(table, ns);
    } else if (_.get(table, '_context') === 'resolve') {
      // If the data needs to be resolved -- resolve
      return resolve(table, ns);
    }
    console.log(table);
    return rx.Observable.of(table);
  });
}

function resolve(table, ns) {
  rx.Observable.from(_.toPairs(table))
    .mergeMap(([key, val]) => {
      if (_.get(val, '_context') === 'execute') {
        return tableEval(val, ns).map(result => [key, result]);
      }
      if (_.isString(val) && !_.startsWith('_', key)) {
        return rx.Observable.of([key, argUtils.symInNamespace(val, ns)]);
      }
      if (_.get(val, '_context') === 'resolve') {
        return resolve(val, ns).map(result => [key, result]);
      }
      return rx.Observable.of(val);
    })
    .toArray()
    .map((acc, resolvedData) => {
      let result = _.reduce(
        resolvedData,
        (acc, [key, val]) => {
          acc[key] = val;
          return acc;
        },
        {}
      );
      return new (types.Table())(undefined, result);
    });
}

function runStatement(statement, ns) {
  console.log('running statement', statement);
  let retVal = null;
  if (statement.method._eval) {
    // If native JS method
    try {
      retVal = statement.method._eval(
        statement.root,
        statement.args,
        ns,
        tableEval,
        types
      );
    } catch (err) {
      errors.failedToExecuteJSMethod(statement.root, statement.method, err);
    }
  } else {
    // If Bosc method
    let argObj = {};
    let index = 0;
    let arg = null;
    while ((arg = statement.method.args[index++])) {
      argObj[arg] = statement.args[index - 1];
    }
    argObj['this'] = statement.root;
    retVal = tableEval(statement.method, ns.concat([newLocal(argObj)]));
  }
  console.log('retVal', retVal);
  if (retVal instanceof rx.Observable) {
    return retVal;
  } else if (retVal instanceof Promise) {
    return rx.Observable.fromPromise(retVal);
  }
  return rx.Observable.of(retVal);
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
