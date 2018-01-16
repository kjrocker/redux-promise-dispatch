import { promiseDispatcher } from './index';

//let b: Array<string> = ['test'];

type TestFunctionType = (a: string, b: string) => Promise<Array<string>>;

let test = promiseDispatcher<TestFunctionType>(
  (a: string, b: string) => {
    return Promise.resolve(['test']);
  },
  { success: 'test', failure: 'test' }
);
