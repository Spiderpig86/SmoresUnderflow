import * as React from 'react';
import { connect } from 'react-redux';
import { Button, FormControl, FormGroup, FormLabel } from 'react-bootstrap';

import { RegisterFormState, RegisterFormStateFields } from '../../states';
import { registerOperations } from './duck';

class RegisterFormComponent extends React.Component {
    public readonly props: any;
    public readonly state: RegisterFormState;

    constructor(props: any) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
            email: '',
            password: '',
            repeatPassword: '',
            username: ''
        };
    }

    public render() {
        return (
            <form
                className="LoginForm col-12 mx-auto my-5"
                onSubmit={this.handleSubmit}
            >
                <FormGroup controlId="username">
                    <FormLabel>Username</FormLabel>
                    <FormControl
                        autoFocus={true}
                        type="username"
                        onChange={this.handleChange.bind(this, 'username')}
                    />
                </FormGroup>
                <FormGroup controlId="email">
                    <FormLabel>Email</FormLabel>
                    <FormControl
                        type="email"
                        onChange={this.handleChange.bind(this, 'email')}
                    />
                </FormGroup>
                <FormGroup controlId="password">
                    <FormLabel>Password</FormLabel>
                    <FormControl
                        onChange={this.handleChange.bind(this, 'password')}
                        type="password"
                    />
                </FormGroup>
                <FormGroup controlId="repeatPassword">
                    <FormLabel>Repeat Password</FormLabel>
                    <FormControl
                        type="password"
                        onChange={this.handleChange.bind(
                            this,
                            'repeatPassword'
                        )}
                    />
                </FormGroup>
                <Button
                    block={true}
                    disabled={!this.validateForm()}
                    type="submit"
                    variant="primary"
                >
                    Register
                </Button>
            </form>
        );
    }

    private validateForm() {
        return (
            this.state.email.length > 0 &&
            this.state.username.length > 0 &&
            this.state.password.length > 0 &&
            this.state.repeatPassword.length > 0
        );
    }

    private handleChange(field: RegisterFormStateFields, e: any) {
        const value = e.target.value;
        this.setState({
            [field]: value
        });
    }

    private async handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const { repeatPassword, ...state } = this.state;

        if (!state.username) {
            this.props.registerError("Username can't be empty.");
            return;
        }

        if (!state.email) {
            this.props.registerError("Email can't be empty.");
            return;
        }

        if (!state.password) {
            this.props.registerError("Password can't be empty.");
            return;
        }

        const re = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
        if (!re.test(state.email.toLowerCase())) {
            this.props.registerError("Email isn't valid.");
            return;
        }

        if (state.password !== repeatPassword) {
            this.props.registerError('Passwords do not match.');
            return;
        }

        try {
            // const res = await fetch(ACCOUNTS_API + '/user/register', {
            //     body: JSON.stringify(state),
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     method: 'POST'
            // });

            // if (!res.ok) {
            //     const error = await res.json();
            //     this.props.handleRegisterError(
            //         `Could not register: ${error.msg}`
            //     );
            // } else {
            //     this.props.handleRegister();
            // }
            this.props.registerRequest({ 
                email: this.state.email,
                password: this.state.password,
                username: this.state.username,
                repeatPassword: this.state.repeatPassword
            });
        } catch (ex) {
            this.props.registerError(`Could not register: ${ex.message}`);
        }
    }
}

function mapStateToProps(state: any) {
    return {
        register: state.registerReducer
    };
}

export default connect(
    mapStateToProps,
    {
        registerRequest: registerOperations.registerRequest,
        registerError: registerOperations.registerError
    }
)(RegisterFormComponent);
