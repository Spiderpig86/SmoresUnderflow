import types from './types';

const registerUser = (value: any) => {
    return {
        payload: {
            isRegistered: false,
            registerErrorMessage: null as any
        },
        type: types.REGISTER_REQUEST
    }
}

const registerSuccess = (value: any) => {
    return {
        payload: {
            isRegistered: true,
            username: value.username
        },
        type: types.REGISTER_SUCCESS
    }
}
const registerFailure = (error: string) => {
    return {
        payload: {
            isRegistered: false,
            registerErrorMessage: error
        },
        type: types.REGISTER_FAILURE
    }
}

export default {
    registerFailure,
    registerSuccess,
    registerUser
}