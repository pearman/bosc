const _ = require('lodash');
const Table = require('./table');
const argUtils = require('./utils/argUtils');

let methods = {
  '+': {
    args: argUtils.args('value'),
    _eval: (self, args, ns, tableEval, types) => {
      return new types.String(self.value + args[0].value);
    }
  },
  toSymbol: {
    args: argUtils.args(),
    _eval: (self, args, ns, tableEval, types) => {
      return self.value;
    }
  }
};

module.exports = Table(methods);
