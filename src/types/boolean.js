const _ = require('lodash');
const Table = require('./table');
const argUtils = require('./utils/argUtils');
const tableUtils = require('./utils/tableUtils');

let Boolean = {
  '?': {
    args: { '0': 'ifTrue', '1': 'ifFalse' },
    _eval: (self, args, ns, tableEval) => {
      if (self.value) {
        if (!_.isNil(_.get(args[0], 'value'))) return args[0];
        return tableEval(args[0], ns);
      } else {
        if (!_.isNil(_.get(args[1], 'value'))) return args[1];
        return tableEval(args[1], ns);
      }
    }
  }
};

function boolize(value) {
  return _.merge({}, Table, Boolean, { value });
}

module.exports = _.merge({}, Table, Boolean);
