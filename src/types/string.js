const _ = require('lodash');
const Table = require('./table');
const argUtils = require('./utils/argUtils');

let String = {
  '+': {
    args: argUtils.args(),
    _eval: (self, args, ns, tableEval, types) => {
      let rArgs = argUtils.resolveArgs(args, ns);
      return types.toTypes(self.value + rArgs[0].value, types.String);
    }
  }
};

module.exports = _.merge({}, Table, String);
