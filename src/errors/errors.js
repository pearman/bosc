module.exports = {
  functionDoesNotExist: method => {
    throw {
      err: `Error: Function "${method}" does not exist!`,
      type: 'BoscError'
    };
  },
  symbolDoesNotExist: (obj, curr) => {
    throw {
      err: `Error: Symbol "${curr}" does not exist!`,
      obj,
      type: 'BoscError'
    };
  },
  notValidInfixMethod: method => {
    throw {
      err: `Error: Not a valid infix method!`,
      method,
      type: 'BoscError'
    };
  },
  cannotFindMethod: (obj, method) => {
    let methodName = method;
    let bonusInfo = '';
    if (_.isObject(methodName)) {
      methodName = '[Table]';
      bonusInfo = ', did you forget a comma?';
    }
    throw {
      err: `Error: Cannot find method "${methodName}"${bonusInfo}`,
      obj,
      type: 'BoscError'
    };
  },
  failedToExecuteJSMethod: (obj, method, err) => {
    throw {
      err: `Error: Failed to execute JS method "${method}"\n`,
      jsErr: err,
      obj,
      type: 'BoscError'
    };
  },
  expectingAnotherArgument: (obj, method) => {
    throw {
      err: `Error: Expecting another argument for method "${method}"`,
      obj,
      type: 'BoscError'
    };
  }
};
