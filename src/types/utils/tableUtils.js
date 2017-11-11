const _ = require('lodash');
const util = require('util');

const Table = require('../table.js');

function arrayToTable(array) {
  return _.reduce(
    array,
    (acc, item, index) => {
      acc[index] = item;
      return acc;
    },
    _.merge({}, Table)
  );
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

module.exports = { arrLength, prettyPrint, arrayToTable };