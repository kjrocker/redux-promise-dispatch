export interface Action {
  type: any;
}

export type ReduxThunk<T = any> = (dispatch: Function, getState?: Function) => T;

export type PromiseReturningThunk<T = any> = ReduxThunk<Promise<T>>;

export type ActionCreator = (args?: any) => Action | ReduxThunk;

export type UnsafeActionCreator = string | ActionCreator;

export type wrapInActionCreator = (x: UnsafeActionCreator) => ActionCreator;

export type createActionCreator = (n: string) => ActionCreator;

export type PromiseDispatch = (...args: any[]) => PromiseReturningThunk;

export type PromiseFunction = (...args: any[]) => Promise<any>;

export type EventualPromise = PromiseDispatch | PromiseFunction;

export type EnsurePromise = (
  a: PromiseReturningThunk | Promise<any>,
  dispatch: Function,
  getState: Function
) => Promise<any>;

export type ActionSet = {
  request?: ActionCreator;
  success: ActionCreator;
  failure: ActionCreator;
};

export type UnsafeActionSet = {
  request?: UnsafeActionCreator;
  success: UnsafeActionCreator;
  failure: UnsafeActionCreator;
};
