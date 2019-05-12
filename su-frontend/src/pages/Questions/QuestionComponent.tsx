import * as React from 'react';
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
import axios from 'axios';
import { QUESTIONS_API, STATUS_OK } from '../../utils/const';
import { Question } from '../../states';
import { UserTileComponent } from '../../components/UserTile';
import { VoteComponent } from '../../components/Vote';

import './question.css';

class QuestionComponent extends React.Component {
  public readonly props: any;
  public readonly state: {
    question: Question;
    redirect: boolean;
  }

  constructor(props: any) {
    super(props);
    this.deleteQuestion = this.deleteQuestion.bind(this);
  }
  
  public componentWillMount() {
    
    this.setState({
      question: this.props.question
    });
  }

  public render() {
    const upvoteLink = `${QUESTIONS_API}/${this.state.question.id}/upvote`;
    const deleteBtn = this.props.canShowDelete ? (
        <button className="btn btn-danger" style={{ whiteSpace: "nowrap" }} onClick={ this.deleteQuestion }>Delete Question</button>
    ) : null;
    const redirect = this.state.redirect ? (
      <Redirect to="/" />
    ) : null;
    return (
      <Container className="mt-5 px-0 post-container container-shadow">
        { redirect }
        <div className="post-container-body">
          <UserTileComponent user={this.state.question.user} />
          <Container className="mt-5">
            <h1 style={{ wordBreak: "break-word" }}>{ this.state.question.title }</h1>
            <hr />
            {/* <p className="py-3" style={{ wordBreak: "break-word", whiteSpace: 'pre-wrap' }} >{ this.state.question.body }</p> */}
            <div dangerouslySetInnerHTML={{ __html: this.state.question.body }} />
          </Container>
          <div className="d-flex">
            <VoteComponent score={ this.state.question.score } upvoteLink={ upvoteLink } token={ this.props.token } />
            { deleteBtn }
          </div>
        </div>
      </Container>
    );
  }

  private async deleteQuestion() {
    axios.defaults.withCredentials = true;
    await axios.delete(`${QUESTIONS_API}/${this.state.question.id}`, {
        headers: {
            Cookie: `${this.props.token}; httpOnly;`
        }
    });
    this.setState({
      redirect: true
    });
  }
}

export default QuestionComponent;
