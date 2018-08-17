import { EventEmitter } from 'events';
import { createActionCreator as createFn, wrapInActionCreator as wrapFn } from './types';
import { EnsurePromise, EventualPromise } from './types';

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
  if (typeof result === 'function') {
    //no? ok, we must need to dispatch it.
    return result(dispatch, getState);
  } else {
    return result;
  }
};
