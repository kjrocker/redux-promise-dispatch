const promiseDispatcher = (fn, { request, success, failure }) => {
  return promiseDispatchCreator(fn, {
    request: request && wrapInActionCreator(request),
    success: wrapInActionCreator(success),
    failure: wrapInActionCreator(failure)
  });
};

// Take a method (from our API service), params, and three named action creators
// Execute the standard (request -> success | failure) action cycle for that api call
const promiseDispatchCreator = (fn, { request, success, failure }) => (...params) => dispatch =>
  //adding a return promise so that we can do promise channing
  new Promise((resolve, reject) => {
    request && dispatch(request(...params));
    return fn(...params)
      .then(response => {
        dispatch(success(response, ...params));
        resolve(response);
      })
      .catch(error => {
        dispatch(failure(error, ...params));
        reject(error);
      });
  });

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
