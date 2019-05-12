import types from './types';

const loginUser = (value: any) => {
    return {
        payload: {
            isLoggedIn: false,
        }, // User credentials
        type: types.LOGIN_REQUEST
    }
};

const loginSuccess = (value: any) => {
    return {
        payload: {
            isLoggedIn: true,
            token: value.token,
            cookie: value.cookie
        },
        type: types.LOGIN_SUCCESS,
    }
};

const loginFailure = (error: string) => {
    return {
        payload: {
            isLoggedIn: false,
            loginErrorMessage: error
        },
        type: types.LOGIN_FAILURE,
    }
};

const logoutUser = () => {
    return {
        payload: {
            isLoggedIn: false,
            loginErrorMessage: '',
            token: '',
            cookie: '',
        },
        type: types.LOGOUT_REQUEST
    }
}

export default {
    loginFailure,
    loginSuccess,
    loginUser,
    logoutUser,
}