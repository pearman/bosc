const _ = require('lodash');
const Table = require('./table');
const argUtils = require('./utils/argUtils');
const tableUtils = require('./utils/tableUtils');

let Number = {
  '+': {
    args: argUtils.args('number'),
    _eval: (self, args, ns, tableEval, types) =>
      types.toType(self.value + args[0].value, types.Number)
  },
  '-': {
    args: argUtils.args('number'),
    _eval: (self, args, ns, tableEval, types) =>
      types.toType(self.value - args[0].value, types.Number)
  },
  '*': {
    args: argUtils.args('number'),
    _eval: (self, args, ns, tableEval, types) =>
      types.toType(self.value * args[0].value, types.Number)
  },
  '/': {
    args: argUtils.args('number'),
    _eval: (self, args, ns, tableEval, types) =>
      types.toType(self.value / args[0].value, types.Number)
  },
  '<': {
    args: argUtils.args('number'),
    _eval: (self, args, ns, tableEval, types) =>
      types.toType(self.value < args[0].value, types.Boolean)
  },
  '>': {
    args: argUtils.args('number'),
    _eval: (self, args, ns, tableEval, types) =>
      types.toType(self.value > args[0].value, types.Boolean)
  },
  '<=': {
    args: argUtils.args('number'),
    _eval: (self, args, ns, tableEval, types) =>
      types.toType(self.value <= args[0].value, types.Boolean)
  },
  '>=': {
    args: argUtils.args('number'),
    _eval: (self, args, ns, tableEval, types) =>
      types.toType(self.value >= args[0].value, types.Boolean)
  },
  times: {
    args: argUtils.args('function'),
    _eval: (self, args, ns, tableEval, types) => {
      let output = _.times(self.value, i => {
        return tableEval(
          args[0],
          ns.concat([{ [args[0].args[0]]: types.toType(i, types.Number) }])
        );
      });
      let result = tableUtils.arrayToTable(output);
      return _.merge(result, types.Table);
    }
  }
};

module.exports = _.merge({}, Table, Number);
