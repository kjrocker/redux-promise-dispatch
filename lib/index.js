"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
//this function will resolve the generic type for the given promise/dispatch function
exports.functionResolver = function (handler) {
    return handler;
};
exports.promiseDispatcher = function (fn, _a) {
    var request = _a.request, success = _a.success, failure = _a.failure;
    return exports.promiseDispatchCreator(fn, {
        request: request === undefined ? undefined : exports.wrapInActionCreator(request),
        success: exports.wrapInActionCreator(success),
        failure: exports.wrapInActionCreator(failure)
    });
};
// Take a method (from our API service), params, and three named action creators
// Execute the standard (request -> success | failure) action cycle for that api call
exports.promiseDispatchCreator = function (fn, _a) {
    var request = _a.request, success = _a.success, failure = _a.failure;
    var reduxDispatchFunction = function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        return function (dispatch, getState) {
            request !== undefined ? dispatch(request.apply(void 0, params)) : null;
            //capture result.
            var result = fn.apply.apply(fn, [_this].concat(params));
            //did we get a promise?
            if (!result.then) {
                //no? ok, we must need to dispatch it.
                result = result(dispatch, getState);
            }
            //in order for someone to handle success/error we need to create a promise for all dispatch creators.
            return new Promise(function (resolve, reject) {
                result
                    .then(function (response) {
                    dispatch(success.apply(void 0, [response].concat(params)));
                    resolve(response);
                })
                    .catch(function (error) {
                    dispatch(failure.apply(void 0, [error].concat(params)));
                    reject(error);
                });
            });
        };
    };
    return exports.functionResolver(reduxDispatchFunction);
};
exports.createActionCreator = function (name) { return function (payload) {
    return {
        type: name,
        payload: payload
    };
}; };
exports.wrapInActionCreator = function (value) {
    return typeof value === 'function' ? value : exports.createActionCreator(value);
};
