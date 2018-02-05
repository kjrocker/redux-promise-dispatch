//this function will resolve the generic type for the given promise/dispatch function
export const functionResolver = (handler: any) => {
  return handler;
};

export const promiseDispatcher = (fn: any, { request, success, failure }: any) => {
  return promiseDispatchCreator(fn, {
    request: request === undefined ? undefined : wrapInActionCreator(request),
    success: wrapInActionCreator(success),
    failure: wrapInActionCreator(failure)
  });
};

// Take a method (from our API service), params, and three named action creators
// Execute the standard (request -> success | failure) action cycle for that api call
export const promiseDispatchCreator = (fn: any, { request, success, failure }: any) => {
  const reduxDispatchFunction: any = (...params: any[]) => (dispatch: any, getState: any) => {
    request !== undefined ? dispatch(request(...params)) : null;
    //capture result.
    let result = fn(...params);
    let promiseResult: any;
    //did we get a promise?
    if (!(result instanceof Promise)) {
      //no? ok, we must need to dispatch it.
      promiseResult = result(dispatch, getState);
    } else {
      promiseResult = result;
    }
    //in order for someone to handle success/error we need to create a promise for all dispatch creators.
    return new Promise((resolve, reject) => {
      promiseResult
        .then((response: any) => {
          dispatch(success(response, ...params));
          resolve(response);
        })
        .catch((error: any) => {
          dispatch(failure(error, ...params));
          reject(error);
        });
    });
  };
  return functionResolver(reduxDispatchFunction);
};
export const createActionCreator: any = (name: any) => (payload: any) => {
  return {
    type: name,
    payload: payload
  };
};

export const wrapInActionCreator = (value: any) => {
  return typeof value === 'function' ? value : createActionCreator(value);
};
