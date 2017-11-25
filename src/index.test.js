import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { expect } from 'chai';
import { promiseDispatcher, createActionCreator } from './index';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

// Straight from the README
const simplePromise = value => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return value % 2 === 0 ? resolve(`${value} is Even!`) : reject(`Ouch, ${value} is odd!`);
    }, 10);
  });
};

const promiseRequest = createActionCreator('PROMISE_REQUEST');
const promiseSuccess = createActionCreator('PROMISE_SUCCESS');
const promiseFailure = createActionCreator('PROMISE_FAILURE');

describe('dispatchPromise with all actions', () => {
  const dispatchPromise = promiseDispatcher(simplePromise, {
    request: promiseRequest,
    success: promiseSuccess,
    failure: promiseFailure
  });

  it('dispatches the request action', () => {
    const expectedActions = promiseRequest(2);
    const store = mockStore({});
    return store.dispatch(dispatchPromise(2)).then(() => {
      expect(store.getActions()[0]).to.deep.equal(expectedActions);
    });
  });

  it('dispatches the success action', () => {
    const expectedActions = [promiseRequest(2), promiseSuccess('2 is Even!')];
    const store = mockStore({});
    return store.dispatch(dispatchPromise(2)).then(() => {
      expect(store.getActions()).to.deep.equal(expectedActions);
    });
  });

  it('dispatches the failure action', () => {
    const expectedActions = [promiseRequest(3), promiseFailure('Ouch, 3 is odd!')];
    const store = mockStore({});
    return store.dispatch(dispatchPromise(3)).then(() => {
      expect(store.getActions()).to.deep.equal(expectedActions);
    });
  });
});

describe('dispatchPromise without the request action', () => {
  const dispatchPromise = promiseDispatcher(simplePromise, {
    success: promiseSuccess,
    failure: promiseFailure
  });

  it('dispatches the success action', () => {
    const expectedActions = [promiseSuccess('2 is Even!')];
    const store = mockStore({});
    return store.dispatch(dispatchPromise(2)).then(() => {
      expect(store.getActions()).to.deep.equal(expectedActions);
    });
  });

  it('dispatches the failure action', () => {
    const expectedActions = [promiseFailure('Ouch, 3 is odd!')];
    const store = mockStore({});
    return store.dispatch(dispatchPromise(3)).then(() => {
      expect(store.getActions()).to.deep.equal(expectedActions);
    });
  });
});
