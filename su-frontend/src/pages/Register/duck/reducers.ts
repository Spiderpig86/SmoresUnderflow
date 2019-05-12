import types from './types';
import { RegisterState } from '../../../states';

const INITIAL_STATE: RegisterState = {
    isRegistered: false,
    registerErrorMessage: '',
    username: ''
}

const registerReducer = (state = INITIAL_STATE, action: any): RegisterState => {
    switch (action.type) {
        case types.REGISTER_REQUEST: {
            const { payload } = action;
            return {
                ...state,
                isRegistered: payload.isRegistered,
                registerErrorMessage: payload.registerErrorMessage
            }
        }
        case types.REGISTER_SUCCESS: {
            const { payload } = action;
            return {
                ...state,
                isRegistered: payload.isRegistered,
                username: payload.username
            }
        }
        case types.REGISTER_FAILURE: {
            const { payload } = action;
            return {
                ...state,
                isRegistered: payload.isRegistered,
                registerErrorMessage: payload.registerErrorMessage
            }
        }

        default: return state;
    }
}

export default registerReducer;