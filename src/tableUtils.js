const _ = require('lodash');
const util = require('util');
const Number = require('./number.js');

function astToTable(ast) {
  if (ast.type === 'list' || ast.type === 'execute') {
    let base = {};
    if (ast.type === 'execute') base = { _context: 'execute' };
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
    return _.reduce(
      ast.data.slice(1),
      (acc, exp, index) => {
        acc[index] = astToTable(exp);
        return acc;
      },
      { args: astToTable(ast.data[0]) }
    );
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
        acc[key.data] = astToTable(value);
        return acc;
      },
      {}
    );
  }
  if (ast.type === 'symbol') {
    return ast.data;
  }
  if (ast.type === 'number') {
    return _.merge({}, Number, { value: ast.data });
  }
  return ast;
}

function arrLength(table) {
  let index = 0;
  while (table[index++]) {}
  return index - 1;
}

function prettyPrint(x) {
  let opts = { depth: null, colors: 'auto' };
  let s = util.inspect(x, opts);
  console.log(s);
}

module.exports = { astToTable, arrLength, prettyPrint };

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
