import {wrapInActionCreator as wrapFn, createActionCreator as createFn} from './index.d'
import { EventualPromise, EnsurePromise } from './index.d'
import { EventEmitter } from 'events';

export const createActionCreator: createFn = (name) => (payload) => {
  return {
    type: name,
    payload: payload
  };
};

export const wrapInActionCreator: wrapFn = (value) => {
  return typeof value === 'function' ? value : createActionCreator(value);
};

export const typeResolver = <FunctionType extends EventualPromise>(fn: EventualPromise) => {
  return fn as FunctionType;
};

export const ensurePromise: EnsurePromise = (result, dispatch, getState) => {
  if (!(result instanceof Promise)) {
    //no? ok, we must need to dispatch it.
    return result(dispatch, getState);
  } else {
    return result;
  }
}