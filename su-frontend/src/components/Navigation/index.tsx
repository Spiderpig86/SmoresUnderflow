import * as React from 'react';
import {
    Button,
    FormControl,
    InputGroup,
    Nav,
    Navbar,
    NavDropdown
} from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import * as Cookies from 'js-cookie';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { loginOperations } from '../../pages/Login/duck';

import './nav.css';

export class Navigation extends React.Component {
    public readonly props: any;

    public state: any = {
        username: '',
        reputation: 0,
        isTop: true,
        shouldRedirect: false,
        query: '',
        disabled: false
    };
    public scroll$: Subscription;

    constructor(props: any) {
        super(props);
        console.log(props);
        this.scroll$ = null; // Scroll observable
        this.search = this.search.bind(this);
    }

    public componentWillMount() {
        if (this.props.app.user && !this.state.username) {
            this.setState({
                username: this.props.app.user.username,
                reputation: this.props.app.user.reputation
            });
        }
    }

    public componentDidMount() {
        // Set scroll listener
        this.scroll$ = fromEvent(window, 'scroll')
            .pipe(
                debounceTime(100)
            ).subscribe((e: any) => {
                if (window.scrollY > 60) {
                    this.setState({ isTop: false });
                } else {
                    this.setState({ isTop: true })
                }
            });
    }

    public componentWillUnmount() {
        if (this.scroll$) {
            this.scroll$.unsubscribe();
        }
    }

    public componentWillReceiveProps(nextProps: any) {
        if (nextProps.app.user && !this.state.username) {
            this.setState({
                username: nextProps.app.user.username,
                reputation: nextProps.app.user.reputation
            });
        }
    }

    public search(event: any) {
        if (event.key === 'Enter') {
            this.setState({
                shouldRedirect: true
            });
        }
    }

    public componentDidUpdate() {
        // Rendered redirect, make sure that redirect is not present
        if (this.state.shouldRedirect) {
            this.setState({
                shouldRedirect: false
            });
        }
    }

    public render() {
        const dropdown = this.props.app.token ? (
            <NavDropdown
                alignRight={true}
                title={`${this.state.username} (${this.state.reputation})`}
                id="basic-nav-dropdown"
            >
                <NavDropdown.Item href="#action/3.1">Profile</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                    href="#action/3.4"
                    onClick={() =>
                        this.props.logoutRequest(Cookies.get('access_token'))
                    }
                >
                    Logout
                </NavDropdown.Item>
            </NavDropdown>
        ) : (
            <Link className="nav-link" to="/signin">
                <Nav.Item>Login</Nav.Item>
            </Link>
        );

        const redirect = this.state.shouldRedirect ? (
            <Redirect to={`/redirect/${this.state.query}`} />
        ) : null;

        return (
            <Navbar className={ "px-5 Navbar" + (!this.state.isTop ? ' scroll' : '') } bg="light" expand="sm">
                <Link to="/">
                    <Navbar.Brand>
                        <img
                            className="logo"
                            src={process.env.PUBLIC_URL + '../assets/logo.png'}
                        />
                        smores
                        <strong>underflow</strong>
                    </Navbar.Brand>
                </Link>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <InputGroup className="px-5">
                        <FormControl
                            placeholder="Search..."
                            aria-label="Search field"
                            onChange={this.handleChange.bind(this, 'query')}
                            onKeyPress={this.search}
                        />
                        <InputGroup.Append>
                            <Button variant="primary">
                                <Link
                                    className="nav-link p-0 text-white"
                                    to={ `/_search?q=${this.state.query}`}
                                >
                                    Search
                                </Link>
                            </Button>
                        </InputGroup.Append>
                    </InputGroup>
                    <Nav className="ml-auto">
                        <Link className="nav-link" to="/ask">
                            <Nav.Item>Ask</Nav.Item>
                        </Link>
                        {dropdown}
                        {redirect}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }

    private handleChange(field: string, e: any) {
        const value = e.target.value;
        this.setState({
          [field]: value
        });
    }
}

function mapStateToProps(state: any) {
    return {
        app: state.appReducer
    };
}

export default connect(
    mapStateToProps,
    { logoutRequest: loginOperations.logoutRequest }
)(Navigation);
