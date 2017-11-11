const _ = require('lodash');

function symInNamespace(sym, ns) {
  for (let i = ns.length - 1; i >= 0; i--) {
    if (!_.isNil(ns[i][sym])) return ns[i][sym];
  }
  return null;
}

function resolveArgs(args, ns) {
  return _.map(args, arg => resolveArg(arg, ns));
}

function resolveArg(arg, ns) {
  if (_.isString(arg)) return symInNamespace(arg, ns);
  return arg;
}

module.exports = { symInNamespace, resolveArg, resolveArgs };
