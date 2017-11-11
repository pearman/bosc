const _ = require('lodash');
const Table = require('../types/table');
const Number = require('../types/number');
const String = require('../types/string');
const Boolean = require('../types/boolean');

function astToTable(ast) {
  if (_.isNil(ast)) return null;
  if (
    ast.type === 'list' ||
    ast.type === 'execute' ||
    ast.type === 'executeFunction'
  ) {
    let base = _.cloneDeep(Table);

    let context = '';
    if (ast.type === 'list') context = 'resolve';
    else if (ast.type === 'execute') context = 'execute';
    else if (ast.type === 'executeFunction') context = 'executeFunction';

    _.assign(base, { _context: context });
    return _.reduce(
      ast.data,
      (acc, exp, index) => {
        acc[index] = astToTable(exp);
        return acc;
      },
      base
    );
  }
  if (ast.type === 'method') {
    let method = _.reduce(
      ast.data.slice(1),
      (acc, exp, index) => {
        acc[index] = astToTable(exp);
        return acc;
      },
      _.merge({}, Table, {
        args: astToTable(ast.data[0])
      })
    );
    //console.log('METHOD', method);
    return method;
  }
  if (ast.type === 'map') {
    let keyValuePairs = [];
    _.forEach(ast.data, (value, index) => {
      if (index % 2 === 0) keyValuePairs.push([value]);
      else _.last(keyValuePairs).push(value);
    });
    return _.reduce(
      keyValuePairs,
      (acc, [key, value]) => {
        acc[_.get(key, 'value', key)] = astToTable(value);
        return acc;
      },
      _.merge({ _context: 'resolve' }, Table)
    );
  }
  if (ast.type === 'symbol') {
    return ast.data;
  }
  if (ast.type === 'number') {
    return _.merge({}, Number, { value: ast.data });
  }
  if (ast.type === 'string') {
    return _.merge({}, String, { value: ast.data });
  }
  if (ast.type === 'boolean') {
    return _.merge({}, Boolean, { value: ast.data });
  }
  return ast;
}

function setLazyExecute(table) {
  if (!_.isObject(table)) return table;

  if (_.get(table, '_context') === 'execute') table._context = 'lazyExecute';

  let index = 0;
  let curr;
  while ((curr = table[index++])) {
    if (_.get(curr, '_context') === 'execute') {
      table[index - 1]['_context'] = 'lazyExecute';
    }
    setLazyExecute(table[index - 1]);
  }

  return table;
}

module.exports = { astToTable, setLazyExecute };

function test() {
  let testMap = {
    type: 'map',
    data: [
      { type: 'symbol', data: 'cool' },
      { type: 'number', data: 3 },
      { type: 'symbol', data: 'awesome' },
      { type: 'string', data: 'posum' }
    ]
  };

  let testList = {
    type: 'list',
    data: [
      { type: 'number', data: 1 },
      { type: 'number', data: 2 },
      { type: 'number', data: 3 }
    ]
  };

  let testMethod = {
    type: 'method',
    data: [
      { type: 'list', data: [{ type: 'symbol', data: 'x' }] },
      { type: 'symbol', data: 'x' },
      { type: 'symbol', data: '+' },
      { type: 'number', data: 3 }
    ]
  };

  let testNumber = { type: 'number', data: 3 };
  console.log(astToTable(testList));
  console.log(astToTable(testMap));
  console.log(astToTable(testMethod));
  console.log(astToTable(testNumber));
}
