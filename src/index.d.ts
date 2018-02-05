export type wrapInActionCreator = (x: UnsafeActionCreator) => ActionCreator;

export type createActionCreator = (n: string) => ActionCreator;

export type promiseDispatcher = (fn: Function, obj: UnsafeActionSet) => PromiseDispatch;

export type promiseDispatchCreator = (fn: Function, obj: ActionSet) => PromiseDispatch;

export type PromiseDispatch = (...args: any[]) => PromiseReturningThunk;

export type PromiseFunction = (...args: any[]) => Promise<any>;

export type PromiseReturningThunk = (dispatch: Function, getState: Function) => Promise<any>;

export type ReduxThunk = (dispatch: Function, getState: Function) => any;

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
