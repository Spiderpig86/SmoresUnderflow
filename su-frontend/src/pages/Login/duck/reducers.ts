import types from './types';
import { LoginState } from '../../../states';

const INITIAL_STATE: LoginState = {
    isLoggedIn: false,
    token: '',
    loginErrorMessage: '',
    
}

const loginReducer = (state = INITIAL_STATE, action: any): LoginState => {
    switch (action.type) {
        case types.LOGIN_REQUEST: {
            const { payload } = action;
            return {
                ...state,
                isLoggedIn: payload.isLoggedIn,
                loginErrorMessage: ''
            }
        }
        
        case types.LOGIN_SUCCESS: {
            const { payload } = action;
            return {
                ...state,
                isLoggedIn: payload.isLoggedIn,
                token: payload.token,
            }
        }

        case types.LOGIN_FAILURE: {
            const { payload } = action;
            return {
                ...state,
                isLoggedIn: payload.isLoggedIn,
                loginErrorMessage: payload.loginErrorMessage
            }
        }

        case types.LOGOUT_REQUEST: {
            const { payload } = action;
            return {
                ...state,
                isLoggedIn: payload.isLoggedIn,
                loginErrorMessage: payload.loginErrorMessage,
                token: payload.token,
            }
        }


        default: return state;
    }
}

export default loginReducer;