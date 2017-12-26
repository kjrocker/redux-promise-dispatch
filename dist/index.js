'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var promiseDispatcher = function promiseDispatcher(fn, _ref) {
  var request = _ref.request,
      success = _ref.success,
      failure = _ref.failure;

  return promiseDispatchCreator(fn, {
    request: request && wrapInActionCreator(request),
    success: wrapInActionCreator(success),
    failure: wrapInActionCreator(failure)
  });
};

// Take a method (from our API service), params, and three named action creators
// Execute the standard (request -> success | failure) action cycle for that api call
var promiseDispatchCreator = function promiseDispatchCreator(fn, _ref2) {
  var request = _ref2.request,
      success = _ref2.success,
      failure = _ref2.failure;
  return function () {
    for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
      params[_key] = arguments[_key];
    }

    return function (dispatch, getState) {
      request && dispatch(request.apply(undefined, params));
      //capture result.
      var result = fn.apply(undefined, params);
      //we're we passed a promise?
      if (!result.then) {
        //no? ok, we must need to dispatch it.
        result = result(dispatch, getState);
      }
      return new Promise(function (resolve, reject) {
        result.then(function (response) {
          dispatch(success.apply(undefined, [response].concat(params)));
          resolve(response);
        }).catch(function (error) {
          dispatch(failure.apply(undefined, [error].concat(params)));
          reject(error);
        });
      });
    };
  };
};
// const promiseDispatchCreator2 = (fn, { request, success, failure }) => (...params) => dispatch =>
//   //adding a return promise so that we can do promise channing
//   new Promise((resolve, reject) => {
//     request && dispatch(request(...params));
//     Promise.resolve(fn(...params))
//       .then(response => {
//         dispatch(success(response, ...params));
//         resolve(response);
//       })
//       .catch(error => {
//         dispatch(failure(error, ...params));
//         reject(error);
//       });
//   });

var createActionCreator = function createActionCreator(name) {
  return function (payload) {
    return {
      type: name,
      payload: payload
    };
  };
};

var wrapInActionCreator = function wrapInActionCreator(value) {
  return typeof value === 'function' ? value : createActionCreator(value);
};

exports.promiseDispatcher = promiseDispatcher;
exports.createActionCreator = createActionCreator;
exports.wrapInActionCreator = wrapInActionCreator;
exports.promiseDispatchCreator = promiseDispatchCreator;