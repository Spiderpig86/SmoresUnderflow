import * as React from 'react';
import { connect } from 'react-redux';
import * as Cookies from 'js-cookie';
import * as qs from 'query-string';

import { NavLink, Redirect } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import SearchFormComponent from './components/SearchFormComponent';

class SearchContainer extends React.Component {
    public readonly props: any;
    public readonly state: any;

    constructor(props: any) {
        super(props);
        this.state = {
            searchQuery: ''
        }
    }

    public componentWillMount() {
        const query = qs.parse(this.props.location.search);
        this.setState({
            searchQuery: query.q ? query.q : ''
        });
    }

    public componentWillReceiveProps() {
        const query = qs.parse(this.props.location.search);
        this.setState({
            searchQuery: query.q ? query.q : ''
        });
        this.forceUpdate();
        console.log(query.q);
    }

    public render() {
        // const needsToLogin = !Cookies.get('access_token') && !localStorage.getItem('access_token') && !this.props.login.isLoggedIn ? (
        //     <Redirect to='/signin' />
        // ) : null;
        return (
            <div>
                {/* { needsToLogin } */}
                <Navigation />
                <SearchFormComponent timestamp={ this.state.timestamp } query={ this.state.searchQuery } token={ this.props.app.token } />
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


export default connect(mapStateToProps, null)(SearchContainer);