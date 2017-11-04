const _ = require('lodash');

function symInScope(sym, memory) {
  for (let i = memory.length - 1; i >= 0; i--) {
    if (!_.isNil(memory[i][sym])) return memory[i][sym];
  }
  return null;
}

let Mem = {
  set: {
    args: { '0': 'key', '1': 'value' },
    _eval: (self, args, memory) => {
      return _.set(_.last(memory), [args[0]], args[1]);
    }
  },
  get: {
    args: { '0': 'key' },
    _eval: (self, args, memory) => {
      return symInScope(args[0], memory);
    }
  }
};

module.exports = Mem;
