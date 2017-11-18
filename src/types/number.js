const _ = require('lodash');
const Table = require('./table');
const argUtils = require('./utils/argUtils');
const tableUtils = require('./utils/tableUtils');

let methods = {
  '+': {
    args: argUtils.args('number'),
    _eval: (self, args, ns, tableEval, types) =>
      new types.Number(self.value + args[0].value)
  },
  '-': {
    args: argUtils.args('number'),
    _eval: (self, args, ns, tableEval, types) =>
      new types.Number(self.value - args[0].value)
  },
  '*': {
    args: argUtils.args('number'),
    _eval: (self, args, ns, tableEval, types) =>
      new types.Number(self.value * args[0].value)
  },
  '/': {
    args: argUtils.args('number'),
    _eval: (self, args, ns, tableEval, types) =>
      new types.Number(self.value / args[0].value)
  },
  '<': {
    args: argUtils.args('number'),
    _eval: (self, args, ns, tableEval, types) =>
      new types.Boolean(self.value < args[0].value)
  },
  '>': {
    args: argUtils.args('number'),
    _eval: (self, args, ns, tableEval, types) =>
      new types.Boolean(self.value > args[0].value)
  },
  '<=': {
    args: argUtils.args('number'),
    _eval: (self, args, ns, tableEval, types) =>
      new types.Boolean(self.value <= args[0].value)
  },
  '>=': {
    args: argUtils.args('number'),
    _eval: (self, args, ns, tableEval, types) =>
      new types.Boolean(self.value >= args[0].value)
  },
  times: {
    args: argUtils.args('function'),
    _eval: (self, args, ns, tableEval, types) => {
      let output = _.times(self.value, i => {
        return tableEval(
          args[0],
          ns.concat([{ [args[0].args[0]]: new types.Number(i) }])
        );
      });
      let result = tableUtils.arrayToTable(output);
      return new (types.Table())(undefined, result);
    }
  }
};

module.exports = Table(methods);
