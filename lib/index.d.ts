export declare type ReduxAction = {
    type: string;
    payload: any;
};
export declare type ActionCreator = (args?: any) => ReduxAction | ReduxThunk;
export declare type UnsafeActionCreator = string | ActionCreator;
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
export declare type wrapInActionCreator = (x: UnsafeActionCreator) => ActionCreator;
export declare type createActionCreator = (n: string) => ActionCreator;
export declare type promiseDispatcher = (fn: Function, obj: UnsafeActionSet) => PromiseDispatch;
export declare type promiseDispatchCreator = (fn: Function, obj: ActionSet) => PromiseDispatch;
export declare type PromiseDispatch = (...args: any[]) => PromiseReturningThunk;
export declare type PromiseFunction = (...args: any[]) => Promise<any>;
export declare type PromiseReturningThunk = (dispatch: Function, getState: Function) => Promise<any>;
export declare type ReduxThunk = (dispatch: Function, getState: Function) => any;
export declare const promiseDispatcher: <FunctionType extends PromiseFunction>(fn: FunctionType, {request, success, failure}: UnsafeActionSet) => FunctionType;
export declare const functionResolver: <FunctionType extends PromiseFunction>(handler: PromiseDispatch | PromiseFunction) => FunctionType;
export declare const promiseDispatchCreator: <FunctionType extends PromiseFunction>(fn: FunctionType, {request, success, failure}: ActionSet) => FunctionType;
export declare const createActionCreator: createActionCreator;
export declare const wrapInActionCreator: wrapInActionCreator;
