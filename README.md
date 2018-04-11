# redux-promise-dispatch

A straightforward yet flexible wrapper for promises and redux actions.

Let's get to the examples! I'm going to use plain strings for my action types. If you do this in a real codebase, I'm going to glare at you through the internet.

## Super Basic Usage

You're going to need exactly four things.
1. A function that returns a promise
2. Three action creators
  * One to dispatch before the promise starts
  * One to dispatch when the promise resolves/succeeds
  * One to dispatch when the promise rejects/fails

```js
// Something that returns a promise
const timedPromise = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve("Success"), 250)
  })
}

// Redux actions for promise start/success/failure
const startingPromise = () => ({type: "PROMISE START"})
const successfulPromise = () => ({type: "PROMISE SUCCESS"})
const failedPromise = () => ({type: "PROMISE FAILURE"})

// Define the wrapped promise (secretly just a thunk)
const wrappedPromise = promiseDispatcher(timedPromise, {
  request: startingPromise,
  success: successfulPromise,
  failure: failedPromise
})

// Dispatch the wrapped action to redux
// Dispatches the start action, starts the promise,
// dispatches success/failure actions as needed
dispatch(wrappedPromise())
```

## Basic Usage

Okay, that was really boring, and we didn't even touch on what `promiseDispatcher` does with arguments.

Now we're going to make some changes
1. Let the promise returning function have arguments
2. Let the initial action take the same arguments
3. Let the success action take the results of `resolve`
4. Let the failure action take the results of `reject`
5. We're going to pass the arguments from `1` when we call the wrapped action

```js
// Take some arguments, return a promise
const interestingPromise = (value) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return value % 2 === 0 ? resolve(`${value} is Even!`) : reject(`Ouch, ${value} is odd!`)
    }, 500)
  })
}

// Action creator with the same arguments as the above function
const startingPromise = (value) => ({type: "PROMISE START", payload: value})

// Action creator that takes the result of promise success
const successfulPromise = (text) => ({type: "PROMISE SUCCESS", payload: text})

// Action creator that takes the result of promise failure
const failedPromise = (text) => ({type: "PROMISE FAILURE", payload: text})

// Define the wrapped promise (secretly just a thunk)
const wrappedPromise = promiseDispatcher(interestingPromise, {
  request: startingPromise,
  success: successfulPromise,
  failure: failedPromise
})

// Dispatch to redux, provide the starting arguments
dispatch(wrappedPromise(2))
```

License
-------
MIT
