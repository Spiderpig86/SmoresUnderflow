import * as React from 'react';

import { Button, FormControl, FormGroup, FormLabel } from 'react-bootstrap';
import { LoginFormState, LoginFormStateFields } from '../../states';
import { connect } from 'react-redux';

import { loginOperations } from './duck';
import { appOperations } from '../../duck';

class LoginFormComponent extends React.Component {
    public readonly props: any;
    public readonly state: LoginFormState;
    public token: string;

    constructor(props: any) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.token = '';

        this.state = {
            username: '',
            password: ''
        };
    }

    public componentWillReceiveProps(newProps: any) {
        
        if (newProps.login.token && !this.token && this.state.username) {
            this.token = newProps.login.token;
            this.props.fetchUserData(this.state.username, newProps.login.token);
        }
    }
    
    public render() {
        return (
            <form
                className="LoginForm col-12 mx-auto my-5"
                onSubmit={this.handleSubmit}
            >
                <FormGroup controlId="email">
                    <FormLabel>Username</FormLabel>
                    <FormControl
                        autoFocus={true}
                        type="text"
                        onChange={this.handleChange.bind(this, 'username')}
                    />
                </FormGroup>
                <FormGroup controlId="password">
                    <FormLabel>Password</FormLabel>
                    <FormControl
                        onChange={this.handleChange.bind(this, 'password')}
                        type="password"
                    />
                </FormGroup>
                <Button
                    block={true}
                    disabled={!this.validateForm()}
                    type="submit"
                    variant="primary"
                >
                    Login
                </Button>
            </form>
        );
    }

    private validateForm() {
        return this.state.username.length > 0 && this.state.password.length > 0;
    }

    private handleChange(field: LoginFormStateFields, e: any) {
        const value = e.target.value;
        this.setState({
            [field]: value
        });
    }


    private async handleSubmit(e: React.FormEvent) {
        // const re = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
        // if (!re.test(this.state.username.toLowerCase())) {
        //     this.props.handleLoginError('Invalid credentials.');
        //     return;
        // }

        // if (this.state.password === undefined || !this.state.password.length) {
        //     this.props.handleLoginError('Invalid credentials.');
        //     return;
        // }

        e.preventDefault();
        try {
            // const res = await fetch(ACCOUNTS_API + '/login', {
            //     body: JSON.stringify(this.state),
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     method: 'POST'
            // }).then(data => data.json());

            // if (res && res.body.status === STATUS_OK) {
            //     // select the initial role to set the user views
            //     this.props.handleLogin();
            // } else {
            //     const err = await res.json();
            //     this.props.handleLoginError(err.msg);
            // }
            this.props.loginRequest({ username: this.state.username, password: this.state.password });
        } catch (ex) {
            this.props.handleLoginError(`Could not log in: ${ex.message}`);
        }
    }
}

function mapStateToProps(state: any) {
    return {
        app: state.appReducer,
        login: state.loginReducer
    };
}

export default connect(mapStateToProps, { loginRequest: loginOperations.loginRequest, fetchUserData: appOperations.fetchUserData })(LoginFormComponent);