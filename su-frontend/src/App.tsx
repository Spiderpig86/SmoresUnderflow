import * as React from 'react';
import './App.css';
import { Route, Switch, Redirect } from 'react-router-dom';
import * as Cookies from 'js-cookie';
import axios from 'axios';
import { connect } from 'react-redux';

import LoginContainer from './pages/Login/LoginContainer';
import RegisterContainer from './pages/Register/RegisterContainer';
import HomeContainer from './pages/Home/HomeContainer';
import { AppState } from './states';
import { ACCOUNTS_API, STATUS_ERR } from './utils/const';
import { appOperations } from './duck';
import { Auth } from './utils/auth';
import AskContainer from './pages/Ask/AskContainer';
import QuestionsContainer from './pages/Questions/QuestionsContainer';
import SearchContainer from './pages/Search/SearchContainer';
import RedirectContainer from './pages/Redirect/RedirectContainer';

class App extends React.Component {
    public readonly state: AppState;
    public readonly props: any;

    constructor(props: any) {
        super(props);
    }

    public componentDidMount() {
        this.initData();
    }

    public async initData() {
        const cookie = Cookies.get('access_token') || localStorage.getItem('access_token');

        // No cookie set, do not login
        if (!cookie) {
            return;
        }

        // Test if we are using a valid token
        axios.defaults.withCredentials = true;
        const res = await axios.post(`${ACCOUNTS_API}/test`, {
            headers: {
                Cookie: `${cookie}; httpOnly;`
            }
        });
        if (!res || res.data.status === STATUS_ERR) {
            Cookies.remove('access_token');
            localStorage.removeItem('access_token'); // Token no longer valid
            return;
        }

        const auth = new Auth();
        try {
            const data = await auth.validate(cookie);
            if (!data.username) {
                return;
            }
            this.props.fetchUserData(data.username, cookie);
        } catch (e) {
            console.log('ERROR: Invalid token');
        }
    }

    public render() {
        return (
            <Switch>
                <Route
                    exact={false}
                    path="/signin"
                    render={props => <LoginContainer />}
                />
                <Route
                    exact={false}
                    path="/register"
                    render={props => <RegisterContainer />}
                />
                <Route
                    exact={true}
                    path="/"
                    render={props => <HomeContainer />}
                />
                <Route
                    exact={true}
                    path="/ask"
                    render={props => <AskContainer />}
                />
                <Route
                    exact={false}
                    path="/_search"
                    render={props => <SearchContainer { ...props } />}
                />
                <Route
                    exact={false}
                    path="/redirect/:query"
                    render={props => <RedirectContainer { ...props } />}
                />
                <Route
                    path="/question/:id"
                    render={props => <QuestionsContainer { ...props }/>}
                />
                <Route render={() => <Redirect to="/" />} />
            </Switch>
        );
    }
}

function mapStateToProps(state: any) {
    return {
        app: state.appReducer,
        login: state.loginReducer
    };
}

export default connect(
    mapStateToProps,
    { fetchUserData: appOperations.fetchUserData }
)(App);
