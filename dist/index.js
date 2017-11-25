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

    return function (dispatch) {
      request && dispatch(request.apply(undefined, params));
      return fn.apply(undefined, params).then(function (response) {
        return dispatch(success(response));
      }).catch(function (error) {
        return dispatch(failure(error));
      });
    };
  };
};

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