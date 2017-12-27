const axios = require('axios');
const argUtils = require('../src/types/utils/argUtils');

const _ = require('lodash');
const Table = require('../src/types/table');

let methods = {
  get: {
    args: argUtils.args('config'),
    _eval: (self, args, ns, tableEval, types) => {
      if (_.isString(_.get(args[0], 'value'))) {
        return axios
          .get(_.get(args[0], ['value']))
          .then(result => result.data)
          .catch(err => {
            console.error(err);
            return err;
          });
      }
      return axios
        .get(_.get(args[0], ['url', 'value']), _.get(args[0], ['config']))
        .then(result => result.data)
        .catch(err => {
          console.error(err);
          return err;
        });
    }
  }
};

module.exports = new (Table(methods))();
// https://www.random.org/integers/?num=100&min=1&max=100&col=5&base=10&format=plain&rnd=new
