import * as React from 'react';
import { connect } from 'react-redux';
import { NavLink, Redirect } from 'react-router-dom';
import Navigation from '../../../components/Navigation';
import {
  Container,
  Row,
  FormGroup,
  FormLabel,
  FormControl,
  Form,
  Button,
  Alert,
  Col
} from 'react-bootstrap';
import '../SearchForm.css';
import axios from 'axios';
import { SEARCH_API, STATUS_OK } from '../../../utils/const';
import { SearchResultComponent } from './SearchResultComponent';
import { SearchResultState, Question } from '../../../states';

class SearchFormComponent extends React.Component {
  public readonly props: any;
  public readonly state: {
    timestamp: number;
    limit: number;
    query: string;
    questions: Question[];
    errorMessage: string;
    tags: string;
    sortByTime: boolean;
    showMediaOnly: boolean;
    showAcceptedOnly: boolean;
  };

  constructor(props: any) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      timestamp: this.props.timestamp,
      limit: this.props.limit,
      query: this.props.query,
      questions: [],
      errorMessage: '',
      tags: '',
      sortByTime: false,
      showMediaOnly: false,
      showAcceptedOnly: false
    }
  }

  public async componentDidMount() {
    this.setState({
      timestamp: this.props.timestamp,
      query: this.props.query
    });
    console.log(this.props.query);
    if (this.state.query && this.state.query.length > 0) {
      await this.search();
    }
  }

  public render() {
    const results = this.state.questions.map((question: any, i: number) => {
      const q: SearchResultState = {
        acceptedAnswerId: question.accepted_answer_id,
        answerCount: question.answer_count,
        body: question.body,
        _id: question.id,
        media: question.media,
        score: question.score,
        tags: question.tags,
        timestamp: question.timestamp,
        title: question.title,
        user: question.user,
        viewCount: question.view_count
      }
      return (
        <SearchResultComponent key={q._id} question={q} />
      )
    });

    return (
      <form onSubmit={this.handleSubmit}>
        <Container className="mt-5">
          <h1>Search</h1>
          <div className="mt-5" />
          <Container>
            <Form.Row>
              <FormGroup as={Col} md="4">
                <FormLabel>Timestamp</FormLabel>
                <FormControl
                  onChange={this.handleChange.bind(this, 'timestamp')}
                  type="number"
                />
              </FormGroup>
              <Form.Group as={Col} md="4">
                <Form.Label>Limit</Form.Label>
                <Form.Control
                  onChange={this.handleChange.bind(this, 'limit')}
                  type="number"
                />
              </Form.Group>
              <Form.Group as={Col} md="4">
                <Form.Label>Tags</Form.Label>
                <Form.Control
                  onChange={this.handleChange.bind(this, 'tags')}
                  type="text"
                />
              </Form.Group>
            </Form.Row>
            <Form.Row className="justify-content-end">

              <div key='inline-checkbox' className="mb-3">
                <Form.Check type="checkbox" inline label="Show Questions with Media" id="inline-checkbox-1" name="showMediaOnly" onClick={ this.handleCheckboxChange.bind(this) } />
                <Form.Check type="checkbox" inline label="Show Accepted" id="inline-checkbox-2" name="showAcceptedOnly" onClick={ this.handleCheckboxChange.bind(this) } />
              </div>

              <div key='inline-radio' className="mb-3">
                <Form.Check name="searchOptions" inline label="Sort by Time" type="radio" id={`inline-radio-1`} onClick={this.setSortByTime.bind(this, true)} />
                <Form.Check name="searchOptions" inline defaultChecked label="Sort by Score" type="radio" id={`inline-radio-2`} onClick={this.setSortByTime.bind(this, false)} />
              </div>

              <Button
                variant="primary"
                disabled={!this.validateForm()}
                type="submit"
              >
                Apply
              </Button>
            </Form.Row>
          </Container>
          <Container className="pt-5">
              <>
                {results}
              </>
          </Container>
        </Container>
      </form>
    );
  }

  private async handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await this.search();
  }

  private async search() {
    const tags = this.state.tags.replace(', ', '').split(',');
    const body = {
      ...this.state.timestamp && { timestamp: this.state.timestamp },
      ...this.state.limit && { limit: this.state.limit },
      ...this.state.query && { q: this.state.query },
      ...this.state.sortByTime && { sort_by: 'timestamp' },
      ...this.state.showMediaOnly && { has_media: true },
      ...this.state.showAcceptedOnly && { accepted: true },
      ...tags[0] && { tags } 
    };

    try {
      axios.defaults.withCredentials = true;
      const res = await axios.post(`${SEARCH_API}`, body, {
        headers: {
          Cookie: `${this.props.token}; httpOnly;`
        }
      });
      if (res.data.status === STATUS_OK) {
        this.setState({
          questions: res.data.questions
        });
      } else {
        this.setState({
          errorMessage: `Oops! Something went wrong. ${res.data.error}`
        });
      }
      this.forceUpdate();
    } catch (e) {
      this.setState({
        errorMessage: e
      });
    }
  }

  private validateForm() {
    return (
      this.state.timestamp > 0 &&
      new Date(Number(this.state.timestamp)).getTime() > 0 &&
      this.state.limit > 0 &&
      !isNaN(this.state.limit) || ((this.state.limit === undefined
      && this.state.timestamp === undefined && this.state.tags === '') || this.state.tags)
    );
  }

  private handleChange(field: string, e: any) {
    const value = e.target.value;
    this.setState({
      [field]: value
    });
  }

  private handleCheckboxChange(e: any) {
    const target = e.target
    const checked = target.checked
    const name = target.name
    this.setState({
        [name]: checked,
    });
  }

  private setSortByTime(sortByTime: boolean) {
    this.setState({
      sortByTime
    });
  }
}

export default SearchFormComponent;
