import * as React from 'react';
import './login.css';

import { Alert, Container } from 'react-bootstrap';
import { NavLink, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import { LoginState } from '../../states';
import LoginFormComponent from './LoginFormComponent';

class LoginContainer extends React.Component {
    public readonly props: any;
    public readonly state: LoginState;

    constructor(props: any) {
        super(props);
    }

    public componentDidMount() {
        document.title = 'Smores Underflow - Login';
    }

    public render() {
        const errorDialog = !this.props.login.isLoggedIn && this.props.login.loginErrorMessage ? (
            <Alert variant="danger">
                { this.props.login.loginErrorMessage }
            </Alert>
        ) : null;

        const success = this.props.login.isLoggedIn && this.props.login.token && !this.props.login.loginErrorMessage || this.props.app.token ? (
            <Redirect to='/' />
        ) : null;

        return (
            <div className="Login h-100 d-flex justify-content-center align-items-center">
                <Container>
                    <div className="text-center my-3">
                        <img
                            className="logo"
                            src={process.env.PUBLIC_URL + '../assets/logo.png'}
                        />
                        <h1 className="mt-4">smores<strong>underflow</strong></h1>
                    </div>
                    <LoginFormComponent
                    />
                    {errorDialog}
                    {success}

                    <p className="text-right">Don't have an account? 
                    <NavLink to="/register" className="ml-1" href="#">Sign Up</NavLink></p>
                </Container>
            </div>
        );
    }
}

function mapStateToProps(state: any) {
    return {
        app: state.appReducer,
        login: state.loginReducer
    };
}

export default connect(mapStateToProps, null)(LoginContainer);