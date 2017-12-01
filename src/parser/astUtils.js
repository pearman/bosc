const _ = require('lodash');
const types = require('../types/types');

function astToTable(ast) {
  if (_.isNil(ast)) return null;
  if (
    ast.type === 'list' ||
    ast.type === 'execute' ||
    ast.type === 'executeFunction'
  ) {
    let context = '';
    if (ast.type === 'list') context = 'resolve';
    else if (ast.type === 'execute') context = 'execute';
    else if (ast.type === 'executeFunction') context = 'executeFunction';

    let data = _.reduce(
      ast.data,
      (acc, exp, index) => {
        acc[index] = astToTable(exp);
        return acc;
      },
      { _context: context }
    );
    let value = new (types.Table())(undefined, data);
    // console.log(value.__proto__);
    // console.log(value['=']);
    return value;
  }
  if (ast.type === 'method') {
    let data = _.reduce(
      ast.data.slice(1),
      (acc, exp, index) => {
        acc[index] = astToTable(exp);
        return acc;
      },
      {
        args: astToTable(ast.data[0])
      }
    );
    //console.log('METHOD', method);
    return new (types.Table(data))(undefined, data);
  }
  if (ast.type === 'map') {
    let keyValuePairs = [];
    _.forEach(ast.data, (value, index) => {
      if (index % 2 === 0) keyValuePairs.push([value]);
      else _.last(keyValuePairs).push(value);
    });
    let data = _.reduce(
      keyValuePairs,
      (acc, [key, value]) => {
        acc[_.get(key, 'value', key)] = astToTable(value);
        return acc;
      },
      { _context: 'resolve' }
    );
    return new (types.Table())(undefined, data);
  }
  if (ast.type === 'symbol') {
    return ast.data;
  }
  if (ast.type === 'number') {
    return new types.Number(ast.data);
  }
  if (ast.type === 'string') {
    return new types.String(ast.data);
  }
  if (ast.type === 'boolean') {
    return new types.Boolean(ast.data);
  }
  return ast;
}

module.exports = { astToTable };
