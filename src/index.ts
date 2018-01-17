export type ReduxAction = { type: string; payload: any };

export type ActionCreator = (args?: any) => ReduxAction | ReduxThunk;

export type UnsafeActionCreator = string | ActionCreator;

export interface ActionSet {
  request?: ActionCreator;
  success: ActionCreator;
  failure: ActionCreator;
}

export interface UnsafeActionSet {
  request?: UnsafeActionCreator;
  success: UnsafeActionCreator;
  failure: UnsafeActionCreator;
}

export type wrapInActionCreator = (x: UnsafeActionCreator) => ActionCreator;

export type createActionCreator = (n: string) => ActionCreator;

export type promiseDispatcher = (fn: Function, obj: UnsafeActionSet) => PromiseDispatch;

export type promiseDispatchCreator = (fn: Function, obj: ActionSet) => PromiseDispatch;

export type PromiseDispatch = (...args: any[]) => PromiseReturningThunk;

export type PromiseFunction = (...args: any[]) => Promise<any>;

export type PromiseReturningThunk = (dispatch: Function, getState: Function) => Promise<any>;

export type ReduxThunk = (dispatch: Function, getState: Function) => any;

export const promiseDispatcher = <FunctionType extends PromiseFunction>(
  fn: FunctionType,
  { request, success, failure }: UnsafeActionSet
) => {
  return promiseDispatchCreator(fn, {
    request: request === undefined ? undefined : wrapInActionCreator(request),
    success: wrapInActionCreator(success),
    failure: wrapInActionCreator(failure)
  });
};

//this function will resolve the generic type for the given promise/dispatch function
export const functionResolver = <FunctionType extends PromiseFunction>(handler: PromiseDispatch | PromiseFunction) => {
  return handler as FunctionType;
};

// Take a method (from our API service), params, and three named action creators
// Execute the standard (request -> success | failure) action cycle for that api call
export const promiseDispatchCreator = <FunctionType extends PromiseFunction>(
  fn: FunctionType,
  { request, success, failure }: ActionSet
) => {
  const reduxDispatchFunction = (...params: any[]) => (dispatch: Function, getState: Function) => {
    request !== undefined ? dispatch(request(...params)) : null;
    //capture result.
    let result = fn.apply(this, ...params);
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
  return functionResolver<FunctionType>(reduxDispatchFunction);
};
export const createActionCreator: createActionCreator = name => payload => {
  return {
    type: name,
    payload: payload
  };
};

export const wrapInActionCreator: wrapInActionCreator = value => {
  return typeof value === 'function' ? value : createActionCreator(value);
};
