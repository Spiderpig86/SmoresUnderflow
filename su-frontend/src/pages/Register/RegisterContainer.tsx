import * as React from 'react';
import './register.css';

import { Alert, Container } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';

import RegisterFormComponent from './RegisterFormComponent';

class RegisterContainer extends React.Component {
    public readonly props: any;

    constructor(props: any) {
        super(props);
    }

    public componentDidMount() {
        document.title = 'Smores Underflow - Register';
    }

    public render() {
        const errorDialog =
            !this.props.register.isRegistered && this.props.register.registerErrorMessage ? (
                <Alert variant="danger">{this.props.register.registerErrorMessage}</Alert>
            ) : null;
        const success =
            this.props.register.isRegistered &&
            this.props.register.username &&
            !this.props.register.registerErrorMessage ? (
                <Alert variant="success">
                    {
                        'Registration successful! Please check your email to verify your account and then proceed to '
                    }{' '}
                    <NavLink to="/signin" className="ml-1" href="#">
                        Log In
                    </NavLink>
                </Alert>
            ) : null;

        return (
            <div className="Register h-100 d-flex justify-content-center align-items-center">
                <Container>
                    <div className="text-center my-3">
                        <img
                            className="logo"
                            src={process.env.PUBLIC_URL + '../assets/logo.png'}
                        />
                        <h1 className="mt-4">
                            smores<strong>underflow</strong>
                        </h1>
                    </div>
                    <RegisterFormComponent />
                    {errorDialog}
                    {success}

                    <p className="text-right">
                        Have an account already?
                        <NavLink to="/signin" className="ml-1" href="#">
                            Log In
                        </NavLink>
                    </p>
                </Container>
            </div>
        );
    }
}

function mapStateToProps(state: any) {
    return {
        register: state.registerReducer
    };
}

export default connect(
    mapStateToProps,
    null
)(RegisterContainer);
