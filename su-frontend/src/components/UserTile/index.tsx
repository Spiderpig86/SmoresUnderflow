import * as React from 'react';
import { Badge, Row, Col } from 'react-bootstrap';

import './usertile.css'
import NavLink from 'react-bootstrap/NavLink';

export class UserTileComponent extends React.PureComponent {

    public readonly props: any;
    public readonly state: any;

    constructor(props: any) {
        super(props);
    }

    public componentWillMount() {
        this.setState({
            username: this.props.user.username,
            score: this.props.user.reputation,
        });
    }

    public render() {
        return (
            <div className="d-flex user-tile">
                <div className="w-25 pr-3">
                    <img src={`https://ui-avatars.com/api/?name=${this.state.username}&background=0D8ABC&color=fff`} />
                </div>
                <div className="w-70">
                    <h4 className="title">{ this.state.username }</h4>
                    <p className="detail mb-0">{ this.state.score } points</p>
                </div>
            </div>
        )
    }
}