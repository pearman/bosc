const _ = require('lodash');
const util = require('util');

function arrayToTable(array) {
  return _.reduce(
    array,
    (acc, item, index) => {
      acc[index] = item;
      return acc;
    },
    {}
  );
}

function arrLength(table) {
  let index = 0;
  while (table[index++]) {}
  return index - 1;
}

function prune(table) {
  if (_.isNil(table)) return table;
  let pruned = _.omitBy(
    table,
    (entry, key) => _.has(entry, '_eval') || key === '_context'
  );
  if (_.has(pruned, 'value')) return _.get(pruned, 'value');
  let extraPruned = _.mapValues(pruned, value => {
    if (_.isEqual(value, table)) return '[self]';
    if (_.isObject(value)) return prune(value);
    return value;
  });
  return extraPruned;
}

function prettyPrint(table, preferValue = true) {
  let opts = { depth: null, colors: 'auto' };
  let printValue = table;
  if (preferValue) {
    let value = _.get(table, 'value');
    if (_.isUndefined(value)) value = prune(table);
    printValue = value;
  }
  let out = util.inspect(printValue, opts);
  console.log(out.replace("'[self]'", 'self'));
}

function arrayMap(arr, fn) {
  let index = 0;
  let curr;
  let newArr = _.merge({}, Table);
  while ((curr = arr[index++])) {
    newArr[index - 1] = fn(curr);
  }
  return newArr;
}

module.exports = { arrLength, prettyPrint, arrayToTable, arrayMap };
