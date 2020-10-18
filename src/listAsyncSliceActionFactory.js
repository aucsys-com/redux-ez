import {createAsyncThunk} from "@reduxjs/toolkit";
import {enqueueSnackbar} from "./Notifier/notifierSlice";

// const paramsExample = {
//     actionName: "getUser",
//     storeName: "SINGLE_USER_STORE_NAME",
//     entityNameInStore: "",
//     thunkName: "/users/user/get",
//     thunkAction: (arg, thunkAPI) => {return `/users/${arg}`},
//     showToastOnSuccess: true,
//     showToastOnFail: true,
//
// }

/**
 * @param thunkAction {function(Object, ThunkAPI)} - Async action to execute in thunk
 * @param onFulfilled {function(state, action)} - Optional function that modifies state
 * */
export function makeAsyncListSliceActions({
                                          actionName,
                                          thunkName,
                                          storeName,
                                          thunkAction,
                                          onFulfilledFunc,
                                          entityNameInStore,
                                          showToastOnSuccess,
                                          showToastOnFail
}) {
    if (!actionName) {
        throw new Error("Provide unique name for this slice");
    }

    if (!thunkName) {
        throw new Error("Provide unique name for this async thunk");
    }

    if (!storeName) {
        throw new Error("Provide store name");
    }

    if(!thunkAction){
        throw new Error("Provide thunk action")
    }
    
    const stateNames = {
        entity: entityNameInStore,
        loading: actionName + "Loading",
        currentRequestId: actionName + "CurrentRequestId",
        actionCompleted: actionName + "Completed",
        error: actionName + "Error",
    }

    const initialState = {
        [stateNames.entity]: null,
        [stateNames.loaderIndicator]: {},
        [stateNames.actionCompletedIndicator]: {},
        [stateNames.currentRequestId]: {},
        [stateNames.error]: null
    }

    const asyncThunk = createAsyncThunk(
        thunkName,
        async (arg, thunkAPI) => {
            const store = thunkAPI.getState()[storeName];

            const loaderIndicator = store[stateNames.loading][arg.id];
            const currentRequestId = store[stateNames.currentRequestId][arg.id];

            if (!loaderIndicator || thunkAPI.requestId !== currentRequestId) {
                return;
            }

            return await thunkAction(arg, thunkAPI);
        }
    );

    const extraReducers = {
        [asyncThunk.pending]: (state, action) => {
            if (!state[stateNames.loading][action.meta.arg.id]) {
                state[stateNames.loading][action.meta.arg.id] = true;
                state[stateNames.currentRequestId][action.meta.arg.id] = action.meta.requestId;
                state[stateNames.error] = null;
                state[stateNames.actionCompleted][action.meta.arg.id] = false;
            }
        },
        [asyncThunk.fulfilled]: (state, action) => {
            const {requestId} = action.meta;
            if (state[stateNames.loaderIndicator][action.meta.arg.id] && state[stateNames.currentRequestId][action.meta.arg.id] === requestId) {

                if(onFulfilledFunc){
                    onFulfilledFunc(state, action, stateNames)
                }

                state[stateNames.actionCompleted][action.meta.arg.id] = true;
                if (showToastOnSuccess) {
                    action.asyncDispatch(enqueueSnackbar(
                        {
                            message: "Success",
                            options: {
                                variant: 'success'
                            }
                        }
                    ));
                }
            }
        },
        [asyncThunk.rejected]: (state, action) => {
            const {requestId} = action.meta;
            if (state[stateNames.loading][action.meta.arg.id] && state[stateNames.currentRequestId][action.meta.arg.id] === requestId) {
                state[stateNames.loading][action.meta.arg.id] = false;
                state[stateNames.error][action.meta.arg.id] = action.payload || action.error.message;
                state[stateNames.currentRequestId][action.meta.arg.id] = null;

                if (showToastOnFail) {
                    action.asyncDispatch(enqueueSnackbar(
                        {
                            message: state[stateNames.error],
                            options: {
                                variant: 'error'
                            }
                        }
                    ));
                }
            }
        }
    }

    return {
        initialState: initialState,
        thunk: asyncThunk,
        reducers: extraReducers,
        stateNames: stateNames
    }
}