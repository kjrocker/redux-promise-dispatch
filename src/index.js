const promiseDispatcher = (fn, { request, success, failure }) => {
  return promiseDispatchCreator(fn, {
    request: request && wrapInActionCreator(request),
    success: wrapInActionCreator(success),
    failure: wrapInActionCreator(failure)
  });
};

// Take a method (from our API service), params, and three named action creators
// Execute the standard (request -> success | failure) action cycle for that api call
const promiseDispatchCreator = (fn, { request, success, failure }) => (...params) => (dispatch, getState) => {
  request && dispatch(request(...params));
  //capture result.
  let result = fn(...params);
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

const createActionCreator = name => payload => {
  return {
    type: name,
    payload: payload
  };
};

const wrapInActionCreator = value => {
  return typeof value === 'function' ? value : createActionCreator(value);
};

export { promiseDispatcher, createActionCreator, wrapInActionCreator, promiseDispatchCreator };
