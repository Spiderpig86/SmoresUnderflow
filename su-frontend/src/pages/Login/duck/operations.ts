import axios from 'axios';
import Actions from './actions';
import { Dispatch } from 'redux';
import * as Cookies from 'js-cookie';

import { ILoginFormState } from '../../../states';
import { STATUS_ERR, ACCOUNTS_API } from '../../../utils/const';

const loginUser = Actions.loginUser;
const loginSuccess = Actions.loginSuccess;
const loginFailure = Actions.loginFailure;
const logoutUser = Actions.logoutUser;

const loginRequest = (credentials: ILoginFormState) => {
    return async (dispatch: Dispatch) => {
        dispatch(loginUser(credentials));
        axios.defaults.withCredentials = true

        axios.post(`${ACCOUNTS_API}/login`, {
            username: credentials.username,
            password: credentials.password
        })
        .then(res => {
            const token = res.data.data.token;
            console.log(res);
            dispatch(loginSuccess({ token }));
            localStorage.setItem('access_token', token);
        })
        .catch((e) => {
            dispatch(loginFailure(e.response.data.error));
        });
    };
};

const logoutRequest = (cookie: string) => {
    return async (dispatch: Dispatch) => {
        await axios.post(`${ACCOUNTS_API}/logout`, {
            headers: {
                Cookie: `${cookie}; httpOnly;`
            }
        });

        // Delete from cookies
        Cookies.remove('access_token');
        localStorage.removeItem('access_token');

        dispatch(logoutUser());
    }
}

export default {
    loginRequest,
    logoutRequest
};
