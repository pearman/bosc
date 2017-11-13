const _ = require('lodash');
const Table = require('./table');
const Boolean = require('./boolean');
const argUtils = require('./utils/argUtils');
const tableUtils = require('./utils/tableUtils');

let Number = {
  '+': {
    args: { '0': 'a' },
    _eval: (self, args, ns) => numberize(self.value + args[0].value)
  },
  '-': {
    args: { '0': 'a' },
    _eval: (self, args, ns) => numberize(self.value - args[0].value)
  },
  '*': {
    args: { '0': 'a' },
    _eval: (self, args, ns) => numberize(self.value * args[0].value)
  },
  '/': {
    args: { '0': 'a' },
    _eval: (self, args, ns) => numberize(self.value / args[0].value)
  },
  '<': {
    args: { '0': 'a' },
    _eval: (self, args, ns) => boolize(self.value < args[0].value)
  },
  times: {
    args: { '0': 'function' },
    _eval: (self, args, ns, tableEval) => {
      let output = _.times(self.value, i => {
        return tableEval(
          args[0],
          ns.concat([{ [args[0].args[0]]: numberize(i) }])
        );
      });
      return tableUtils.arrayToTable(output);
    }
  }
};

function numberize(value) {
  return _.merge({}, Table, Number, { value });
}

function boolize(value) {
  return _.merge({}, Boolean, { value });
}

module.exports = _.merge({}, Table, Number);
