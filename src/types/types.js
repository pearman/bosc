const _ = require('lodash');

const Boolean = require('./boolean');
const Number = require('./number');
const String = require('./string');
const Table = require('./table');

function toType(value, type) {
  return _.merge({}, type, { value });
}

module.exports = {
  toType,
  Boolean,
  Number,
  String,
  Table
};
