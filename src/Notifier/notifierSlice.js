import { createSlice } from '@reduxjs/toolkit'

const notifierSlice = createSlice({
  name: 'notifier',
  initialState: {
    notifications: []
  },
  reducers: {
    enqueueSnackbar: (state, action) => {
      const payload = action.payload

      const key = payload.options && payload.options.key
      const notification = {
        ...payload,
        key: key || new Date().getTime() + Math.random()
      }

      state.notifications = [...state.notifications, notification]
    },

    closeSnackbar: (state, action) => {
      const payload = action.payload
      const key = payload.key
      const dismissAll = payload.key

      state.notifications = state.notifications.map((notification) =>
        dismissAll || notification.key === key
          ? { ...notification, dismissed: true }
          : { ...notification }
      )
    },

    removeSnackbar: (state, action) => {
      const payload = action.payload
      const key = payload.key

      state.notifications = state.notifications.filter(
        (notification) => notification.key !== key
      )
    }
  }
})

const { enqueueSnackbar, removeSnackbar } = notifierSlice.actions
const notifierReducer = notifierSlice.reducer

export { notifierReducer, enqueueSnackbar, removeSnackbar }
