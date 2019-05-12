import * as React from 'react';
import { connect } from 'react-redux';
import { NavLink, Redirect } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import {
    Container,
    Row,
    FormGroup,
    FormLabel,
    FormControl,
    Form,
    Button
} from 'react-bootstrap';
import './home.css';

class HomeComponent extends React.Component {
    public readonly props: any;
    public readonly state = {
        username: ''
    };

    constructor(props: any) {
        super(props);
    }

    public componentWillMount() {
        if (this.props.app.user) {
            this.setState({
                username: this.props.app.user.username
            });
        }
    }

    public componentWillReceiveProps(nextProps: any) {
        if (nextProps.app.user) {
            this.setState({
                username: nextProps.app.user.username
            });
        }
    }

    public render() {
        return (
            <div className="gradient">
                <Container className="pt-5">
                    <h1>Welcome home {this.state.username}!</h1>
                    <p>It's been a while...</p>
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

export default connect(
    mapStateToProps,
    null
)(HomeComponent);
