import { combineReducers } from 'redux';

import loginReducer from '../pages/Login/duck'
import registerReducer from '../pages/Register/duck'
import { UserState } from '../states';

/* SHARED REDUCERS */
const initialUser: UserState = {
    _id: '',
    email: '',
    username: '',
    reputation: 0,
    questions: [],
    answers: [],
    viewedQuestions: []
};

const INITIAL_APP_STATE = {
    token: '',
    user: initialUser
};

const appReducer = (state = INITIAL_APP_STATE, action: any) => {
    switch (action.type) {
        case 'SET_APP_TOKEN': {
            const { payload } = action;
            return {
                ...state,
                token: payload.token
            }
        }
        case 'SET_APP_USER': {
            const { payload } = action;
            return {
                ...state,
                user: payload.user
            }
        }
        default: return INITIAL_APP_STATE;
    }
}

// Get all the reducers in the app for this

const rootReducer = combineReducers({
    appReducer,
    loginReducer,
    registerReducer
});

export default rootReducer;