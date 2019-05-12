import * as React from 'react';
import { Badge, Container } from 'react-bootstrap';
import axios from 'axios';

import './vote.css';

export class VoteComponent extends React.PureComponent {
    public readonly props: any;
    public readonly state: {
        score: 0,
        upvoteLink: '',
        token: '',
        upvotedUsers: [],
        downvotedUsers: [],
        username: '' // Used for checking if the user voted on this entry
    };

    constructor(props: any) {
        super(props);
        this.handleUpvote = this.handleUpvote.bind(this);
        this.handleDownvote = this.handleDownvote.bind(this);
    }

    public componentWillMount() {
        this.setState({
            score: this.props.score,
            upvoteLink: this.props.upvoteLink,
            token: this.props.token
        });
    }

    public async handleUpvote() {
        axios.defaults.withCredentials = true;
        const res = await axios.post(this.state.upvoteLink, { upvote: true }, {
            headers: {
                Cookie: `${this.props.token}; httpOnly;`
            }
        });
        if (res.data.status === 'OK') {
            this.updateScore(res.data.score);
        }
    }

    public async handleDownvote() {
        axios.defaults.withCredentials = true;
        const res = await axios.post(this.state.upvoteLink, { upvote: false }, {
            headers: {
                Cookie: `${this.props.token}; httpOnly;`
            }
        });
        if (res.data.status === 'OK') {
            this.updateScore(res.data.score);
        }
    }

    public render() {
        return (
            <Container>
                <div className="d-flex">
                    <a className="vote-btn" onClick={ this.handleUpvote }>
                        <img src={process.env.PUBLIC_URL + '../../assets/arrow_up.svg'} alt="Like" />
                    </a>
                    <strong style={{ padding: "1rem" }}>{ this.state.score }</strong>
                    <a className="vote-btn" onClick={ this.handleDownvote }>
                        <img src={process.env.PUBLIC_URL + '../../assets/arrow_down.svg'} alt="Dislike" />
                    </a>
                </div>
            </Container>
        );
    }

    private updateScore(score: number) {
        this.setState({
            score
        });
    }
}
