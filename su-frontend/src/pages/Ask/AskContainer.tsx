import * as React from 'react';
import { connect } from 'react-redux';
import * as Cookies from 'js-cookie';

import { NavLink, Redirect } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import AskFormComponent from './AskFormComponent';

class AskContainer extends React.Component {
    public readonly props: any;

    constructor(props: any) {
        super(props);
    }

    public render() {
        // Check if the user needs to login first
        // const needsToLogin = !this.props.app.token &&!this.props.login.isLoggedIn || this.props.login.loginErrorMessage ? (
        //     <Redirect to='/signin' />
        // ) : null;
        const needsToLogin = !Cookies.get('access_token') && !localStorage.getItem('access_token') ? (
            <Redirect to='/signin' />
        ) : null;
        return (
            <div>
                { needsToLogin }
                <Navigation />
                <AskFormComponent />
            </div>
        )
    }
}

function mapStateToProps(state: any) {
    return {
        app: state.appReducer,
        login: state.loginReducer 
    };
}


export default connect(mapStateToProps, null)(AskContainer);