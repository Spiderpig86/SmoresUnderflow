import * as React from 'react';
import { connect } from 'react-redux';
import { NavLink, Redirect } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import axios from 'axios';
import { QUESTIONS_API } from '../../utils/const';
import { Question } from '../../states';
import QuestionComponent from './QuestionComponent';

import './question.css';
import AnswerComponent from './AnswerComponent';
import PostComponent from './PostComponent';

class QuestionsContainer extends React.Component {
    public readonly props: any;
    public readonly state: {
        question: Question;
        answers: any[];
        redirect: boolean;
    };

    constructor(props: any) {
        super(props);
        this.state = {
            question: null,
            answers: [],
            redirect: false
        }

        this.handleAcceptAnswer = this.handleAcceptAnswer.bind(this);
    }

    public async componentDidMount () {
        const { id } = this.props.match.params;

        const questionRes = await axios.get(`${QUESTIONS_API}/${id}`, {
            headers: {
                Cookie: `${this.props.app.token}; httpOnly;`
            }
        });
        if (questionRes.data.status === 'error') {
            this.setState({
                redirect: true
            });
            return;
        }
        this.setState({
            question: questionRes.data.question,
            hasAccepted: questionRes.data.question.accepted_answer_id !== null
        });
        await this.fetchAnswers(id, this.props.app.token);
    }

    public async fetchAnswers(id: string, token: string): Promise<void> {
        const answerRes = await axios.get(`${QUESTIONS_API}/${id}/answers`, {
            headers: {
                Cookie: `${token}; httpOnly;`
            }
        });
        const answers = answerRes.data.answers;
        this.setState({
            answers
        });
    }

    public handleAcceptAnswer(id: string) {
        this.setState({
            question: {...this.state.question, accepted_answer_id: id},
            canAnswer: false
        });
    }

    public render() {
        // Redirect if the question id is invalid
        if (this.state.redirect) {
            return (
                <Redirect to="/" />
            );
        }

        // Check if the user needs to login first
        const canAnswer = this.state.question && (this.props.app.token || this.props.login.isLoggedIn) && !this.props.login.loginErrorMessage ? (
            <PostComponent token={ this.props.app.token } id={ this.state.question.id } reloadAnswers={ this.fetchAnswers.bind(this, this.state.question.id, this.props.app.token) } />
        ) : null;

        const questionComponent = this.state.question ? (
            <QuestionComponent question={ this.state.question } token={ this.props.app.token } canShowDelete={ this.props.app.token && this.props.app.user.username === this.state.question.user.username} />
        ) : null;
        let answerComponents = null;
        if (this.state && this.state.question && this.state.answers) {
            answerComponents = this.state.answers.map((answer: any, i: number) => {
                return (
                    <AnswerComponent key={ answer.id } answer={answer} token={ this.props.app.token } canShowAccept={ this.props.app.token && this.props.app.user.username === this.state.question.user.username && this.state.question.accepted_answer_id === null} handleAccept={ this.handleAcceptAnswer } />
                )
            });
        }
        // TODO: Convert object
        return (
            <div>
                <Navigation />
                { questionComponent }
                { answerComponents }
                { canAnswer }
                <div className="mb-5"/>
            </div>
        )
    }

    public reloadAnswers() {
        this.forceUpdate();
    }
}

function mapStateToProps(state: any) {
    return {
        app: state.appReducer,
        login: state.loginReducer 
    };
}


export default connect(mapStateToProps, null)(QuestionsContainer);