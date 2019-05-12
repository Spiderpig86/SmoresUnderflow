import * as React from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { NavLink, Redirect } from 'react-router-dom';
import {
    Container,
    Row,
    Form,
    Button,
} from 'react-bootstrap';
import { ANSWERS_API, STATUS_OK, QUESTIONS_API } from '../../utils/const';

import './question.css';

class PostComponent extends React.Component {
    public readonly props: {
        reloadAnswers: () => Promise<void>;
        token: string;
        id: string;
    };
    public readonly state: any = {
        answer: '',
        mediaIds: []
    };

    constructor(props: any) {
        super(props);
        this.postAnswer = this.postAnswer.bind(this);
    }

    public render() {
        return (
            <Container className="mt-5 container-shadow post-container post-container-body">
                <Form.Group>
                    <Form.Label><strong>Your Answer</strong></Form.Label>
                    <Form.Control
                        as="textarea"
                        value={this.state.answer}
                        onChange={this.handleChange.bind(this, 'answer')}
                        rows="5"
                    />
                    <small className="text-muted">
                        Thanks for contributing an answer to Smores Underflow!
                    </small>
                </Form.Group>
                <Button
                    variant="primary"
                    disabled={!this.validateForm()}
                    type="submit"
                    onClick={ this.postAnswer }
                >
                    Post Your Answer
                </Button>
            </Container>
        );
    }

    private handleChange(field: string, e: any) {
        const value = e.target.value;
        this.setState({
            [field]: value
        });
    }

    private validateForm() {
        return this.state.answer.length > 0;
    }

    private async postAnswer() {
        const body = {
            body: this.state.answer,
            media: this.state.mediaIds
        }

        await axios.post(`${QUESTIONS_API}/${this.props.id}/answers/add`, body, {
            headers: {
                Cookie: `${this.props.token}; httpOnly;`
            }
        });

        await this.props.reloadAnswers()
        this.setState({
            answer: ''
        });
    }
}

export default PostComponent;
