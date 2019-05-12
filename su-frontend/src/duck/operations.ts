import { Dispatch } from 'redux';

import Actions from '../pages/Login/duck/actions';
import axios from 'axios';
import { USER_API, STATUS_ERR } from '../utils/const';

const loginFromCookie = (token: string) => {
    return async (dispatch: Dispatch) => {
        dispatch({
            payload: {
                token
            },
            type: 'SET_APP_TOKEN'
        });
        
        dispatch(Actions.loginSuccess({ token }));
    };
};

const fetchUserData = (username: string, token: string) => {
    return async (dispatch: Dispatch) => {
        // Load user data from given auth
        axios.defaults.withCredentials = true;
        const userData = await axios.post(`${USER_API}/detailed/${username}`, {
            headers: {
                Cookie: `${token}; httpOnly;`
            }
        });

        if (userData.data.success === STATUS_ERR) {
            return;
        }

        dispatch({
            payload: {
                token
            },
            type: 'SET_APP_TOKEN'
        })
        dispatch({
            payload: {
                user: userData.data.user
            },
            type: 'SET_APP_USER'
        });
    }
}

export default {
    loginFromCookie,
    fetchUserData
};