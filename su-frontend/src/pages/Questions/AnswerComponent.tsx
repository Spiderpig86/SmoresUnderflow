import * as React from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { NavLink, Redirect } from 'react-router-dom';
import {
    Container,
    Row,
    FormGroup,
    FormLabel,
    FormControl,
    Form,
    Button,
    Alert
} from 'react-bootstrap';
import { ANSWERS_API, STATUS_OK, STATUS_ERR } from '../../utils/const';
import { UserTileComponent } from '../../components/UserTile';
import { VoteComponent } from '../../components/Vote';

import './question.css';
import { Answer } from '../../states';

class AnswerComponent extends React.Component {
    public props: any;
    public readonly state: {
        answer: Answer;
        canShowAccept: boolean;
    };

    constructor(props: any) {
        super(props);
        this.state = {
            answer: null,
            canShowAccept: false
        };
        this.acceptAnswer = this.acceptAnswer.bind(this);
    }

    public componentDidMount() {
        this.setState({
            answer: this.props.answer,
            canShowAccept: this.props.canShowAccept
        });
    }

    public render() {
        const accepted = this.props.answer.is_accepted ? (
            <div className="accepted-answer-label">Accepted Answer</div>
        ) : null;
        const acceptBtn = this.props.canShowAccept ? (
            <button className="btn btn-success" style={{ whiteSpace: "nowrap" }} onClick={ this.acceptAnswer }>Accept Answer</button>
        ) : null;
        const upvoteLink = `${ANSWERS_API}/${this.props.answer.id}/upvote`;
        return (
            <Container className={"mt-5 px-0 container-shadow post-container" + ((this.props.answer.is_accepted) ? " container-accepted" : "")}>
                { accepted }
                <div className="post-container-body">
                    <UserTileComponent user={this.props.answer.userBody} />
                    <Container className="mt-5">
                        <h1>{this.props.answer.title}</h1>
                        <hr />
                        {/* <p className="py-3" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                            {this.props.answer.body}
                        </p> */}
                        
                        <div dangerouslySetInnerHTML={{ __html: this.props.answer.body }} />
                    </Container>
                    <div className="d-flex">
                        <VoteComponent score={ this.props.answer.score } upvoteLink={ upvoteLink } token={ this.props.token } />
                        { acceptBtn }
                    </div>
                </div>
            </Container>
        );
    }

    private async acceptAnswer(event: any) {
        axios.defaults.withCredentials = true;
        const res = await axios.post(`${ANSWERS_API}/${this.state.answer.id}/accept`, {
            headers: {
                Cookie: `${this.props.token}; httpOnly;`
            }
        });

        if (res.data.status === STATUS_ERR) {
            alert('Error: Unable to accept answer.');
        }

        // Update design on front-end
        this.props.answer.is_accepted = true;
        this.props.handleAccept(this.props.answer.id);
    }
}

export default AnswerComponent;
