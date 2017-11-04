const _ = require('lodash');
const Table = require('./table');
const argUtils = require('../argUtils.js');
const tableUtils = require('../tableUtils.js');

let Number = {
  '+': {
    args: { '0': 'a' },
    _eval: (self, args, ns) => {
      let rArgs = argUtils.resolveArgs(args, ns);
      return numberize(self.value + rArgs[0].value);
    }
  },
  '-': {
    args: { '0': 'a' },
    _eval: (self, args, ns) => {
      let rArgs = argUtils.resolveArgs(args, ns);
      return numberize(self.value - rArgs[0].value);
    }
  },
  '*': {
    args: { '0': 'a' },
    _eval: (self, args, ns) => {
      let rArgs = argUtils.resolveArgs(args, ns);
      return numberize(self.value * rArgs[0].value);
    }
  },
  '/': {
    args: { '0': 'a' },
    _eval: (self, args, ns) => {
      let rArgs = argUtils.resolveArgs(args, ns);
      return numberize(self.value / rArgs[0].value);
    }
  },
  times: {
    args: { '0': 'function' },
    _eval: (self, args, ns, tableEval) => {
      //console.log(ns.concat([{ [args[0].args[0]]: numberize(1) }]));
      let output = _.times(self.value, i =>
        tableEval(args[0], ns.concat([{ [args[0].args[0]]: numberize(i) }]))
      );
      return tableUtils.arrayToTable(output);
    }
  }
};

function numberize(value) {
  return _.merge({}, Table, Number, { value });
}

module.exports = _.merge({}, Table, Number);
