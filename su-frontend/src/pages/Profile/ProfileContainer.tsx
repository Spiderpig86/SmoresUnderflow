import * as React from 'react';
import { connect } from 'react-redux';
import { NavLink, Redirect } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import axios from 'axios';
import { QUESTIONS_API } from '../../utils/const';

import './profile.css';
import { UserState } from 'src/states';

class QuestionsContainer extends React.Component {
    public readonly props: any;
    public readonly state: {
        user: UserState;
        redirect: boolean;
    };

    constructor(props: any) {
        super(props);
        this.state = {
            user: null,
            redirect: false
        }
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

    public render() {
        // Redirect if the question id is invalid
        if (this.state.redirect) {
            return (
                <Redirect to="/" />
            );
        }
        return (
            <div>
                <Navigation />
                <h1>Profile</h1>
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