import {SnackbarProvider, useSnackbar} from "notistack";
import {useDispatch, useSelector} from "react-redux";
import {removeSnackbar} from "./notifierSlice";
import React, {useEffect} from "react";

let displayed = [];

const Snackbar = () => {
    const dispatch = useDispatch();
    const notifications = useSelector(store => store.notifications.notifications || []);
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();

    const storeDisplayed = (id) => {
        displayed = [...displayed, id];
    };

    const removeDisplayed = (id) => {
        displayed = [...displayed.filter(key => id !== key)];
    };

    useEffect(() => {
        notifications.forEach(({key, message, options = {}, dismissed = false}) => {
            if (dismissed) {
                // dismiss snackbar using notistack
                closeSnackbar(key);
                return;
            }

            // do nothing if snackbar is already displayed
            if (displayed.includes(key)) return;

            // display snackbar using notistack
            enqueueSnackbar(message, {
                key,
                ...options,
                onClose: (event, reason, myKey) => {
                    if (options.onClose) {
                        options.onClose(event, reason, myKey);
                    }
                },
                onExited: (event, myKey) => {
                    // remove this snackbar from redux store
                    dispatch(removeSnackbar({key: myKey}));
                    removeDisplayed(myKey);
                },
                autoHideDuration: 3000
            });

            // keep track of snackbars that we've displayed
            storeDisplayed(key);
        });
    }, [notifications, closeSnackbar, enqueueSnackbar, dispatch]);

    return null;
};

export default function Notifier() {
    return (
        <SnackbarProvider maxSnack={5}
                          anchorOrigin={{vertical: 'top', horizontal: 'right'}}>
            <Snackbar/>
        </SnackbarProvider>
    )
}
