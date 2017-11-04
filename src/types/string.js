const _ = require('lodash');
const Table = require('./table');
const argUtils = require('../argUtils.js');
const tableUtils = require('../tableUtils.js');

let String = {
  '+': {
    args: { '0': 'a' },
    _eval: (self, args, ns) => {
      let rArgs = argUtils.resolveArgs(args, ns);
      return stringize(self.value + rArgs[0].value);
    }
  }
};

function stringize(value) {
  return _.merge({}, Table, String, { value });
}

module.exports = _.merge({}, Table, String);
