type ReduxAction = { type: string; payload: any };

type ActionCreator = (...args: any[]) => ReduxAction | ReduxThunk;

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

// Args of incoming PromiseDispatch/PromiseFn need to map to the resulting PromiseDispatch
type promiseDispatcher<PromiseDispatchFunctionType = PromiseDispatch> = (
  fn: PromiseDispatchFunctionType,
  obj: UnsafeActionSet
) => PromiseDispatch;

// Args of incoming PromiseDispatch/PromiseFn need to map to the resulting PromiseDispatch
type promiseDispatchCreator<PromiseDispatchFunctionType = PromiseDispatch> = (
  fn: PromiseDispatchFunctionType,
  obj: ActionSet
) => PromiseDispatch;

type PromiseDispatch = (...args: any[]) => PromiseReturningThunk;

type PromiseFn = (...args: any[]) => Promise<any>;

type PromiseReturningThunk = (dispatch: Function, getState: any) => Promise<any>;

type ReduxThunk = (dispatch: Function, getState: any) => any;

const promiseDispatcher = <PromiseDispatchFunctionType extends Function>(
  fn: PromiseDispatchFunctionType | PromiseDispatch,
  { request, success, failure }: UnsafeActionSet
) => {
  return promiseDispatchCreator<PromiseDispatchFunctionType>(fn, {
    request: request === undefined ? undefined : wrapInActionCreator(request),
    success: wrapInActionCreator(success),
    failure: wrapInActionCreator(failure)
  });
};

// Take a method (from our API service), params, and three named action creators
// Execute the standard (request -> success | failure) action cycle for that api call
const promiseDispatchCreator = <PromiseDispatchFunctionType extends Function>(
  fn: PromiseDispatchFunctionType | PromiseDispatch,
  { request, success, failure }: ActionSet
) => (...params: any[]) => {
  return (dispatch: Function, getState: Function) => {
    // Dispatch Request if Present
    request !== undefined ? dispatch(request(...params)) : null;
    // Capture result of the function.
    const result = fn.apply(this, params);

    // Get a promise out of the result, by any means necessary
    let promiseResult: Promise<any>;
    if (!(result instanceof Promise)) {
      promiseResult = result(dispatch, getState);
    } else {
      promiseResult = result;
    }

    // Create a new promise that wraps the result and dispatches success/failure
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
