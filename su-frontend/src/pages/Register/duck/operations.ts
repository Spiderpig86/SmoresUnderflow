import axios from 'axios';
import Actions from './actions';
import { Dispatch } from 'redux';

import { IRegisterFormState } from '../../../states';
import { STATUS_ERR, ACCOUNTS_API } from '../../../utils/const';

const registerUser = Actions.registerUser;
const registerSuccess = Actions.registerSuccess;
const registerFailure = Actions.registerFailure;

const registerRequest = (credentials: IRegisterFormState) => {
    return async (dispatch: Dispatch) => {
        dispatch(registerUser(credentials));

        axios.post(`${ACCOUNTS_API}/adduser`, {
            email: credentials.email,
            password: credentials.password,
            username: credentials.username,
        }).then(res => {
            const username = res.data.data.username;
            dispatch(registerSuccess({ username }));
        }).catch(e => {
            dispatch(registerFailure(e.response.data.error));
        });

    }
}

const registerError = (error: string) => {
    return async (dispatch: Dispatch) => {
        dispatch(registerFailure(error));
    }
}

export default {
    registerRequest,
    registerError
};