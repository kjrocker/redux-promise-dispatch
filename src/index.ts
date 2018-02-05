import {EventualPromise, ActionSet, UnsafeActionSet, PromiseDispatch} from './index.d'
import {wrapInActionCreator, typeResolver, ensurePromise} from './helpers'

export const promiseDispatcher = <FunctionType extends EventualPromise>(fn: FunctionType, { request, success, failure }: UnsafeActionSet) => {
  const readyForDispatch = promiseDispatchCreator(fn, {
    request: request === undefined ? undefined : wrapInActionCreator(request),
    success: wrapInActionCreator(success),
    failure: wrapInActionCreator(failure)
  });
  return typeResolver<FunctionType>(readyForDispatch)
};

// Take a method (from our API service), params, and three named action creators
// Execute the standard (request -> success | failure) action cycle for that api call
export const promiseDispatchCreator = (fn: EventualPromise, { request, success, failure }: ActionSet) => {
  const reduxDispatchFunction: PromiseDispatch = (...params: any[]) => (dispatch, getState) => {
    request !== undefined ? dispatch(request(...params)) : null;
    let result = fn(...params);
    let promiseResult = ensurePromise(result, dispatch, getState);
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
  return reduxDispatchFunction;
};



