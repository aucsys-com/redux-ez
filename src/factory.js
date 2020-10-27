import axios from "axios";
import {makeAsyncSliceActions} from "./asyncSliceActionFactory";
import {makeAsyncListSliceActions} from "./listAsyncSliceActionFactory";

// actions settings object
// const settings = {
//     actionName: "getUser",
//     storeName: "SINGLE_USER_STORE_NAME",
//     entityNameInStore: "user",
//     thunkName: "/users/user/get",
//     showToastOnSuccess: true,
//     showToastOnFail: true,
//     makePath: (req) => {return `/items/${req.id}`}
// }

const ReduxEz = ({
                   baseUrl,
                   makeHeaders
                 }) => {
  const setInterceptors = (client) => {
    client.interceptors.response.use((response) => response, (error) => {
      if (error.response && error.response.data && error.response.data.message) {
        if (error.response.data.message !== "No message available")
          throw new Error(error.response.data.message);
        else
          throw new Error("Sorry, something went wrong");
      } else if (error.message) {
        throw new Error(error.message);
      }

      throw error;
    });

    client.interceptors.request.use((config) => {
      return new Promise((resolve, reject) => {
        makeHeaders().then((headers) => {
          config.headers = headers;
          resolve(config);
        }).catch(err => {
          reject(err)
        });
      });
    });
  }

  const createClient = (baseURL) => {
    const client = axios.create({
      baseURL: baseURL
    });
    setInterceptors(client)
    return client;
  }

  const client = createClient(baseUrl);

  const setEntityOnFulfilled = (state, action, stateNames) => {
    state[stateNames.entity] = action.payload.data;
  }

  const getSliceActions = (settings) => {
    return makeAsyncSliceActions({
      ...settings,
      onFulfilledFunc: setEntityOnFulfilled,
      thunkAction: async (req, thunkAPI) => await client.get(settings.makePath(req) || '')
    })
  }

  const createSliceActions = (settings) => {
    return makeAsyncSliceActions({
      ...settings,
      onFulfilledFunc: setEntityOnFulfilled,
      thunkAction: async (req, thunkAPI) => await client.post(settings.makePath(req) || '', req.body)
    })
  }

  const updateSliceActions = (settings) => {
    return makeAsyncSliceActions({
      ...settings,
      onFulfilledFunc: setEntityOnFulfilled,
      thunkAction: async (req, thunkAPI) => await client.patch(settings.makePath(req) || '', req.body)
    })
  }

  const deleteSliceActions = (settings) => {
    return makeAsyncSliceActions({
      ...settings,
      thunkAction: async (req, thunkAPI) => await client.delete(settings.makePath(req) || '')
    })
  }

  const createInListFulfilled = (state, action, stateNames) => {
    const data = action.payload.data;
    if (Array.isArray(data)) {
      state[stateNames.entity] = [...state[stateNames.entity], ...data];

    } else {
      state[stateNames.entity] = [...state[stateNames.entity], data];
    }
  }

  const createInListActions = (settings) => {
    return makeAsyncListSliceActions({
      ...settings,
      onFulfilledFunc: createInListFulfilled,
      thunkAction: async (req, thunkAPI) => await client.post(settings.makePath(req) || '', req.body)
    })
  }

  const updateInListFulfilled = (state, action, stateNames) => {
    state[stateNames.entity] = state[stateNames.entity].map((entity) => {
      if (entity.id !== action.payload.id) {
        return entity;
      } else {
        return action.payload.data;
      }
    });
  }

  const updateInListActions = (settings) => {
    return makeAsyncSliceActions({
      ...settings,
      onFulfilledFunc: updateInListFulfilled,
      thunkAction: async (req, thunkAPI) => await client.patch(settings.makePath(req) || '', req.body)
    })
  }

  const deleteInListFulfilled = (state, action, stateNames) => {
    state[stateNames.entity] = state[stateNames.entity].filter((entity) => {
      return entity.id !== action.meta.arg.id;
    });
  }

  const deleteInListActions = (settings) => {
    return makeAsyncSliceActions({
      ...settings,
      onFulfilledFunc: deleteInListFulfilled,
      thunkAction: async (req, thunkAPI) => await client.patch(settings.makePath(req) || '', req.body)
    })
  }

  return {
    getSliceActions,
    createSliceActions,
    updateSliceActions,
    deleteSliceActions,
    createInListActions,
    updateInListActions,
    deleteInListActions,
    asyncSliceActions: makeAsyncSliceActions,
    client
  }
}

export {
  ReduxEz
}
