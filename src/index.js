const promiseDispatcher = (fn, { request, success, failure }) => {
  return promiseDispatchCreator(fn, {
    request: wrapInActionCreator(request),
    success: wrapInActionCreator(success),
    failure: wrapInActionCreator(failure)
  });
};

// Take a method (from our API service), params, and three named action creators
// Execute the standard (request -> success | failure) action cycle for that api call
const promiseDispatchCreator = (fn, { request, success, failure }) => (...params) => {
  return dispatch => {
    dispatch(request(...params));
    return fn(...params)
      .then(response => dispatch(success(response)))
      .catch(error => dispatch(failure(error)));
  };
};

const createActionCreator = name => payload => {
  return {
    type: name,
    payload: payload
  };
};

const wrapInActionCreator = value => {
  return typeof value === 'string' ? createActionCreator(value) : value;
};

export { promiseDispatcher, createActionCreator };
