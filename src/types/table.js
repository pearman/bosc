const _ = require('lodash');
const argUtils = require('./utils/argUtils');
const tableUtils = require('./utils/tableUtils');

let Table = {
  ':': {
    args: { '0': 'key', '1': 'value' },
    _doNotResolveArgs: true,
    _eval: (self, args, ns) => {
      _.set(self, [args[0]], argUtils.resolveArg(args[1], ns));
      return self;
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
    _eval: (self, args, ns) => args[0]
  },
  print: {
    args: {},
    _eval: (self, args, ns) => {
      if (!_.isNil(self.value)) console.log(self.value);
      else console.log(self);
      return self;
    }
  },
  deepPrint: {
    args: {},
    _eval: (self, args, ns) => {
      console.log(self);
      return self;
    }
  },
  aPrint: {
    args: {},
    _eval: (self, args, ns) => {
      let index = 0;
      let curr;
      let items = [];
      while ((curr = self[index++])) {
        items.push(_.get(curr, 'value', '[Table]'));
      }
      let output = items.join(',');
      if (output.length > 80) output = output.replace(/[,]/g, '\n');
      else output = output.replace(/[,]/g, ' ');
      console.log(`[${output}]`);
      return self;
    }
  },
  map: {
    args: { '0': 'function' },
    _eval: (self, args, ns, tableEval) => {
      let index = 0;
      let curr;
      let newArr = _.merge({}, Table);
      while ((curr = self[index++])) {
        newArr[index - 1] = tableEval(
          args[0],
          ns.concat([{ [args[0].args[0]]: curr }])
        );
      }
      return newArr;
    }
  },
  reduce: {
    args: { '0': 'function', '1': 'accumulator' },
    _eval: (self, args, ns, tableEval) => {
      let index = 0;
      let curr;
      let newArr = args[1];
      while ((curr = self[index++])) {
        newArr = tableEval(
          args[0],
          ns.concat([{ [args[0].args[0]]: newArr, [args[0].args[1]]: curr }])
        );
      }
      return newArr;
    }
  }
};

module.exports = Table;
