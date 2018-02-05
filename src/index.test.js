import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { expect } from 'chai';
import sinon from 'sinon';
import { promiseDispatcher, createActionCreator } from '../es/index';

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

const promiseThunk = value => (dispatch, getState) => {
  return Promise.resolve(value);
};

const promiseEvents = name => ({
  request: createActionCreator(`${name}_REQUEST`),
  success: createActionCreator(`${name}_SUCCESS`),
  failure: createActionCreator(`${name}_FAILURE`)
});

const promiseRequest = createActionCreator('PROMISE_REQUEST');
const promiseSuccess = createActionCreator('PROMISE_SUCCESS');
const promiseFailure = createActionCreator('PROMISE_FAILURE');

describe('dispatchPromise with promise thunk', () => {
  const myPromiseSpy = sinon.spy(promiseThunk);
  const promiseRequestSpy = sinon.spy(promiseRequest);
  const promiseSuccessSpy = sinon.spy(promiseSuccess);
  const promiseFailureSpy = sinon.spy(promiseFailure);
  const myPromiseThunk = promiseDispatcher(myPromiseSpy, {
    request: promiseRequestSpy,
    success: promiseSuccessSpy,
    failure: promiseFailureSpy
  });

  it('dispatches the request action w/ value', () => {
    const expectedActions = [promiseRequest(2), promiseSuccess(2)];
    const store = mockStore({});
    return store.dispatch(myPromiseThunk(2)).then(() => {
      expect(promiseSuccessSpy.calledWith(2)).to.be.true;
      expect(promiseRequestSpy.calledWith(2)).to.be.true;
      expect(myPromiseSpy.calledWith(2)).to.be.true;
      expect(store.getActions()).to.deep.equal(expectedActions);
    });
  });
});

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
    return store.dispatch(dispatchPromise(3)).catch(() => {
      expect(store.getActions()).to.deep.equal(expectedActions);
    });
  });
});
//this allows you to use promiseDispatcher on a promiseDispatcher
describe('dispatchPromise with all actions that were wrapped x2', () => {
  const primary = promiseEvents('PRIMARY');
  const secondary = promiseEvents('SECONDARY');
  const baseDispatchPromise = promiseDispatcher(simplePromise, primary);
  const dispatchPromise = promiseDispatcher(baseDispatchPromise, secondary);

  it('dispatches the request action', () => {
    const expectedActions = secondary.request(2);
    const store = mockStore({});
    return store.dispatch(dispatchPromise(2)).then(() => {
      expect(store.getActions()[0]).to.deep.equal(expectedActions);
    });
  });

  it('dispatches the success action', () => {
    const expectedActions = [
      secondary.request(2),
      primary.request(2),
      primary.success('2 is Even!'),
      secondary.success('2 is Even!')
    ];
    const store = mockStore({});
    return store.dispatch(dispatchPromise(2)).then(() => {
      expect(store.getActions()).to.deep.equal(expectedActions);
    });
  });

  it('dispatches the failure action', () => {
    const expectedActions = [
      secondary.request(3),
      primary.request(3),
      primary.failure('Ouch, 3 is odd!'),
      secondary.failure('Ouch, 3 is odd!')
    ];
    const store = mockStore({});
    return store.dispatch(dispatchPromise(3)).catch(() => {
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
    return store.dispatch(dispatchPromise(3)).catch(() => {
      expect(store.getActions()).to.deep.equal(expectedActions);
    });
  });
});

describe('dispatchPromise passes the correct payload params', () => {
  const simplePromiseSpy = sinon.spy(simplePromise);
  const promiseRequestSpy = sinon.spy(promiseRequest);
  const promiseSuccessSpy = sinon.spy(promiseSuccess);
  const promiseFailureSpy = sinon.spy(promiseFailure);
  const dispatchPromise = promiseDispatcher(simplePromiseSpy, {
    request: promiseRequestSpy,
    success: promiseSuccessSpy,
    failure: promiseFailureSpy
  });

  it('passes the same params to the promise and request actions', () => {
    const store = mockStore({});
    return store.dispatch(dispatchPromise(2)).then(() => {
      expect(simplePromiseSpy.calledWith(2)).to.be.true;
      expect(promiseRequestSpy.calledWith(2)).to.be.true;
    });
  });

  it('passes resolve to the success action', () => {
    const store = mockStore({});
    return store.dispatch(dispatchPromise(2)).then(() => {
      expect(promiseSuccessSpy.calledWith('2 is Even!')).to.be.true;
    });
  });

  it('passes reject to the failure action', () => {
    const store = mockStore({});
    return store.dispatch(dispatchPromise(3)).catch(() => {
      expect(promiseFailureSpy.calledWith('Ouch, 3 is odd!')).to.be.true;
    });
  });
});

describe('dispatchPromise passes the request params to everything', () => {
  const simplePromiseSpy = sinon.spy(simplePromise);
  const promiseSuccessSpy = sinon.spy(promiseSuccess);
  const promiseFailureSpy = sinon.spy(promiseFailure);

  const dispatchPromise = promiseDispatcher(simplePromiseSpy, {
    success: promiseSuccessSpy,
    failure: promiseFailureSpy
  });

  it('passes request params to the success action', () => {
    const store = mockStore({});
    return store.dispatch(dispatchPromise(2)).then(() => {
      expect(promiseSuccessSpy.calledWith('2 is Even!', 2)).to.be.true;
    });
  });

  it('passes request params to the failure action', () => {
    const store = mockStore({});
    return store.dispatch(dispatchPromise(3)).catch(() => {
      expect(promiseFailureSpy.calledWith('Ouch, 3 is odd!', 3)).to.be.true;
    });
  });
});
