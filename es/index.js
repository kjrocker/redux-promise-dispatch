//this function will resolve the generic type for the given promise/dispatch function
export const functionResolver = handler => {
  return handler;
};
export const promiseDispatcher = (fn, { request, success, failure }) => {
  return promiseDispatchCreator(fn, {
    request: request === undefined ? undefined : wrapInActionCreator(request),
    success: wrapInActionCreator(success),
    failure: wrapInActionCreator(failure)
  });
};
// Take a method (from our API service), params, and three named action creators
// Execute the standard (request -> success | failure) action cycle for that api call
export const promiseDispatchCreator = (fn, { request, success, failure }) => {
  const reduxDispatchFunction = (...params) => (dispatch, getState) => {
    request !== undefined ? dispatch(request(...params)) : null;
    //capture result.
    let result = fn.apply(this, params);
    //did we get a promise?
    if (!result.then) {
      //no? ok, we must need to dispatch it.
      result = result(dispatch, getState);
    }
    //in order for someone to handle success/error we need to create a promise for all dispatch creators.
    return new Promise((resolve, reject) => {
      result
        .then(response => {
          dispatch(success(response, ...params));
          resolve(response);
        })
        .catch(error => {
          dispatch(failure(error, ...params));
          reject(error);
        });
    });
  };
  return functionResolver(reduxDispatchFunction);
};
export const createActionCreator = name => payload => {
  return {
    type: name,
    payload: payload
  };
};
export const wrapInActionCreator = value => {
  return typeof value === 'function' ? value : createActionCreator(value);
};
