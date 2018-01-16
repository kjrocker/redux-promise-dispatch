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

type PromiseDispatcher<Set> = (fn: PromiseFn | PromiseDispatch, obj: Set) => PromiseDispatch;

type PromiseDispatch = (...args: any[]) => PromiseReturningThunk;

type PromiseFn = (...args: any[]) => Promise<any>;

type ReduxThunk<P = any> = (dispatch: Function, getState: Function) => P;

type PromiseReturningThunk<P = any> = ReduxThunk<Promise<P>>;

type UnsafeDispatch = PromiseDispatcher<UnsafeActionSet>;
const promiseDispatcher: UnsafeDispatch = (fn, { request, success, failure }) => {
  return promiseDispatchCreator(fn, {
    request: request === undefined ? undefined : wrapInActionCreator(request),
    success: wrapInActionCreator(success),
    failure: wrapInActionCreator(failure)
  });
};

type SafeDispatch = PromiseDispatcher<ActionSet>;
const promiseDispatchCreator: SafeDispatch = (fn, { request, success, failure }) => (...params: any[]) => {
  return (dispatch, getState) => {
    request !== undefined ? dispatch(request(...params)) : null;

    let result = fn.apply(this, params);
    let promiseResult: Promise<any>;
    if (!(result instanceof Promise)) {
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
