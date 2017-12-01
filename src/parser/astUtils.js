const _ = require('lodash');
const types = require('../types/types');

function removeComments(data) {
  return _.filter(data, item => !_.has(item, '_comment'));
}

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
    let array = removeComments(ast.data);
    let data = _.reduce(
      array,
      (acc, exp, index) => {
        acc[index] = astToTable(exp);
        return acc;
      },
      { _context: context }
    );
    let value = new (types.Table())(undefined, data);
    return value;
  }
  if (ast.type === 'method') {
    let array = removeComments(ast.data);
    let data = _.reduce(
      array.slice(1),
      (acc, exp, index) => {
        acc[index] = astToTable(exp);
        return acc;
      },
      {
        args: astToTable(array[0])
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

module.exports = { astToTable, removeComments };
