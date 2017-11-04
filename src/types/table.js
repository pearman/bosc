const _ = require('lodash');
const argUtils = require('../argUtils.js');

let Table = {
  ':': {
    args: { '0': 'key', '1': 'value' },
    _eval: (self, args, ns) => {
      return _.set(self, [args[0]], argUtils.resolveArg(args[1], ns));
    }
  },
  '.': {
    args: { '0': 'key' },
    _eval: (self, args, ns) => {
      return _.get(self, args[0], null);
    }
  },
  print: {
    args: {},
    _eval: (self, args, ns) => {
      if (self.value) console.log(self.value);
      else console.log(self);
      return self;
    }
  }
};

module.exports = Table;
