const _ = require('lodash');
const argUtils = require('./utils/argUtils.js');

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
      //console.log(self);
      //console.log(_.get(args[0], 'value', args[0]));
      return _.get(self, _.get(args[0], 'value', args[0]), null);
    }
  },
  ',': {
    args: { '0': 'function' },
    _eval: (self, args, ns) => {
      return argUtils.symInNamespace(args[0], ns);
    }
  },
  print: {
    args: {},
    _eval: (self, args, ns) => {
      if (!_.isNil(self.value)) console.log(self.value);
      else console.log(self);
      return self;
    }
  }
};

module.exports = Table;
