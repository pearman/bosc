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

function clone(table) {
  let newTable = _.cloneDeep(table);
  Object.setPrototypeOf(newTable, Object.getPrototypeOf(table));
  return table;
}

function toArray(table) {
  let index = 0;
  let output = [];
  while (table[index++]) {
    output.push(table[index - 1]);
  }
  return output;
}

function push(table, value) {
  let out = clone(table);
  let index = arrLength(out);
  out[index] = value;
  return out;
}

function concat(a, b) {
  let array = toArray(a);
  let array2 = toArray(b);
  let newArray = array.concat(array2);
  let out = arrayToTable(newArray);
  Object.setPrototypeOf(out, Object.getPrototypeOf(a));
  return out;
}

function join(table, separator) {
  return toArray(prune(table)).join(separator);
}

function merge(a, b) {
  let out = _.merge({}, a, b);
  Object.setPrototypeOf(out, Object.getPrototypeOf(a));
  return out;
}

function prune(table) {
  if (_.isNil(table)) return table;
  if (_.isString(table)) return table;
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
  let out = util
    .inspect(printValue, opts)
    .replace("'[self]'", 'self')
    .replace('_eval: {}', 'JSMethod');
  console.log(out);
}

module.exports = {
  arrLength,
  prettyPrint,
  arrayToTable,
  push,
  toArray,
  join,
  concat,
  merge,
  clone
};
