import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { removeSnackbar } from './notifierSlice'
import React, { useEffect } from 'react'
import 'react-toastify/dist/ReactToastify.css';

const Snackbar = () => {
  const dispatch = useDispatch()
  const notifications = useSelector(
    (store) => store.notifications.notifications || []
  )

  useEffect(() => {
    notifications.forEach(({ key, message, options = {} }) => {

      // do nothing if snackbar is already displayed
      if (toast.isActive(key)) return

      const notificationOptions = {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        toastId: key
      }

      switch (options.variant) {
        case 'error':
          toast.error(message, notificationOptions)
          break
        case 'success':
          toast.success(message, notificationOptions)
          break
        case 'info':
          toast.info(message, notificationOptions)
          break
        case 'warning':
          toast.warning(message, notificationOptions)
          break
        default:
          toast(message, notificationOptions)
          break
      }

      dispatch(removeSnackbar({ key: key }))
    })
  }, [notifications, dispatch])

  return null
}

export default function Notifier() {
  return (
    <div>
      <ToastContainer />
      <Snackbar />
    </div>
  )
}
