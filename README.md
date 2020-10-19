# redux-ez

> Ez reducers for your basic CRUD needs

[![NPM](https://img.shields.io/npm/v/redux-ez.svg)](https://www.npmjs.com/package/redux-ez) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save redux-ez
```

## Usage
1. Create instance of ReduxEz
    ```jsx
    const ez = ReduxEz({
        baseUrl: "https://example.com/api",
        makeHeaders: async () => {return {'x-header': 'value'}}
    })
    ```
1. Use exposed methods to create slice actions with desired functionality
   ```jsx
    const {
        initialState: testInitialState,
        thunk: getTest,
        reducers: testReducers,
        stateNames: getTestStateNames
    } = getSliceActions({
         actionName: "getTest",
         storeName: TEST_STORE_NAME,
         entityNameInStore: "test",
         thunkName: "/test/get",
         showToastOnSuccess: true,
         showToastOnFail: true,
         makePath: (payload) => { // Action payload
             return `/test/${payload.id}`
         }
    })

   ```

## License

MIT © [aucsys-com](https://github.com/aucsys-com)
