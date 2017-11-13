const _ = require('lodash');
const Table = require('./table');
const argUtils = require('./utils/argUtils');
const tableUtils = require('./utils/tableUtils');

let Boolean = {
  '?': {
    args: argUtils.args('ifTrue', 'ifFalse'),
    _doNotEvalArgs: true,
    _eval: (self, args, ns, tableEval) => {
      let rArgs = argUtils.resolveArgs(args, ns);
      let retVal = null;
      if (self.value) {
        if (!_.isNil(_.get(rArgs[0], 'value'))) retVal = rArgs[0];
        else retVal = tableEval(rArgs[0], ns);
      } else {
        if (!_.isNil(_.get(rArgs[1], 'value'))) retVal = rArgs[1];
        else retVal = tableEval(rArgs[1], ns);
      }
      return retVal;
    }
  }
};

function boolize(value) {
  return _.merge({}, Table, Boolean, { value });
}

module.exports = _.merge({}, Table, Boolean);
