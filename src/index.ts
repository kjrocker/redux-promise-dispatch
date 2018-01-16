type ReduxAction = { type: string; payload: any };

type ActionCreator = (args?: any) => ReduxAction | ReduxThunk;

type UnsafeActionCreator = string | ActionCreator;

interface ActionSet {
  request?: ActionCreator;
  success: ActionCreator;
  failure: ActionCreator;
}

interface UnsafeActionSet {
  request?: UnsafeActionCreator;
  success: UnsafeActionCreator;
  failure: UnsafeActionCreator;
}

type wrapInActionCreator = (x: UnsafeActionCreator) => ActionCreator;

type createActionCreator = (n: string) => ActionCreator;

type promiseDispatcher = (fn: Function, obj: UnsafeActionSet) => PromiseDispatch;

type promiseDispatchCreator = (fn: Function, obj: ActionSet) => PromiseDispatch;

type PromiseDispatch = (...args: any[]) => PromiseReturningThunk;

type PromiseReturningThunk = (dispatch: Function, getState: any) => Promise<any>;

type ReduxThunk = (dispatch: Function, getState: any) => any;

const promiseDispatcher: promiseDispatcher = (fn, { request, success, failure }) => {
  return promiseDispatchCreator(fn, {
    request: request === undefined ? undefined : wrapInActionCreator(request),
    success: wrapInActionCreator(success),
    failure: wrapInActionCreator(failure)
  });
};

// Take a method (from our API service), params, and three named action creators
// Execute the standard (request -> success | failure) action cycle for that api call
const promiseDispatchCreator: promiseDispatchCreator = (fn, { request, success, failure }) => (...params: any[]) => {
  return (dispatch, getState) => {
    request !== undefined ? dispatch(request(...params)) : null;
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
};

const createActionCreator: createActionCreator = name => payload => {
  return {
    type: name,
    payload: payload
  };
};

const wrapInActionCreator: wrapInActionCreator = value => {
  return typeof value === 'function' ? value : createActionCreator(value);
};

export { promiseDispatcher, createActionCreator, wrapInActionCreator, promiseDispatchCreator };
