const _ = require('lodash');

let Number = {
  '+': {
    args: { '0': 'a' },
    _eval: (self, args) => {
      return _.assign({}, Number, { value: self.value + args[0].value });
    }
  },
  '-': {
    args: { '0': 'a' },
    _eval: (self, args) => {
      return _.assign({}, Number, { value: self.value - args[0].value });
    }
  },
  '*': {
    args: { '0': 'a' },
    _eval: (self, args) => {
      return _.assign({}, Number, { value: self.value * args[0].value });
    }
  },
  '/': {
    args: { '0': 'a' },
    _eval: (self, args) => {
      return _.assign({}, Number, { value: self.value / args[0].value });
    }
  }
};

module.exports = Number;
