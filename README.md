# redux-promise-dispatch

A straightforward yet flexible wrapper for asynchronously generating redux actions. `redux-promise-dispatch` dispatches actions at the beginning and successful completion (`resolve`) or failure `(reject)` of a promise.

For example, the start, or `request` action, is fired when you first call the action creator. This can be used for tasks like marking a `fetching` flag as `true`.

The `success` action is dispatched when the promise resolves, and the `failure` action is dispatched if the promise rejects. The result of your promise as well as any arguments passed into the original

## Examples 

### Super Basic Usage

You're going to need exactly four things.

1. A function that returns a promise.

2. Three action creators
  * One to dispatch before the promise starts (`request`)
  * One to dispatch when the promise resolves/succeeds (`success`)
  * One to dispatch when the promise rejects/fails (`failure`)

```js
// Something that returns a promise
const timedPromise = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve("Success"), 250)
  })
}

// Redux actions for promise start/success/failure
const startingPromise = () => ({type: "PROMISE_START"})
const successfulPromise = () => ({type: "PROMISE_SUCCESS"})
const failedPromise = () => ({type: "PROMISE_FAILURE"})

// Define the wrapped promise (secretly just a thunk)
const yourAction = promiseDispatcher(timedPromise, {
  request: startingPromise,
  success: successfulPromise,
  failure: failedPromise
})

// Dispatch the wrapped action to redux
// Dispatches the start action, starts the promise,
// dispatches success/failure actions as needed
dispatch(yourAction()) // In this example only the action types make it to the reducer
```

## Basic Usage

Okay, that was really boring, and we didn't even touch on what `promiseDispatcher` does with arguments. This example will show you how to pass arguments and use them throughout the lifecycle of your promise and its results.

Now we're going to make some changes
1. Have the promise returning function (`promiseToExecute`) to take a value.
2. Have the initial action (`request`) also use the value passed to `promiseToExecute`.
3. Have the success action (`success`) use the results of `resolve`.
4. Have the failure action (`failure`) use the results of `reject`.
5. We're also going to pass the value we gave `promiseToExecute` when we call the wrapped action.

```js
// Take some arguments, return a promise
const promiseToExecute = (value) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return value % 2 === 0 ? resolve(`${value} is even!`) : reject(`${value} is odd!`)
    }, 500)
  })
}

// Action creator with the same arguments as the above function
const promiseStarted = (value) => ({type: "PROMISE_START", payload: value})

// Action creator that takes the result of promise success
const promiseResolved = (result) => ({type: "PROMISE_SUCCESS", payload: result})

// Action creator that takes the result of promise failure
const promiseRejected = (result) => ({type: "PROMISE_FAILURE", payload: result})

// Define the wrapped promise
const actionToExecute = promiseDispatcher(promiseToExecute, {
  request: promiseStarted,
  success: promiseResolved,
  failure: promiseRejected
})

// Dispatch to redux, provide the starting arguments
dispatch(actionToExecute(2))  // promiseStarted --> action.payload = 2
                              // promiseResolved --> action.payload = "2 is even!"
```
