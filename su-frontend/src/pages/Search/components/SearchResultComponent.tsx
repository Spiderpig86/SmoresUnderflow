import * as React from 'react';

import { SearchResultState } from '../../../states';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { TagComponent } from '../../../components/Tag';
import { Link } from 'react-router-dom';

import './searchresult.css';

export class SearchResultComponent extends React.PureComponent {
    public readonly props: any;
    public readonly state : {
        question: SearchResultState
    };

    constructor(props: any) {
        super(props);
        this.state = {
            question: null
        };
    }

    public componentWillMount() {
        this.setState({
            question: this.props.question
        });
    }

    public componentWillReceiveProps() {
        this.forceUpdate();
    }

    public render() {
        return (
            <Link to={ `/question/${this.props.question._id}` } className="search-result">
                <Card className="my-5">
                    <Card.Header>Asked on {new Date(this.state.question.timestamp * 1000).toISOString().split('T')[0]}</Card.Header>
                    <Card.Body>
                        <Row className="result-container" style={{ flexWrap: "nowrap" }}>
                            <Col xs={8}>
                                <Card.Title>Q: {this.state.question.title}</Card.Title>
                                <Card.Text>
                                    {this.state.question.body.length > 100
                                        ? this.state.question.body.substr(0, 100) + '...'
                                        : this.state.question.body}
                                </Card.Text>
                            </Col>
                            <Col xs={4} className="text-center d-flex justify-content-center" style={{ flexDirection: "column" }}>
                                <Row style={{ flexWrap: "nowrap" }}>
                                    <Col xs={ 4 }>
                                        
                                        <Card.Title>{this.state.question.score}</Card.Title>
                                        <p className="mb-0">votes</p>
                                    </Col>
                                    <Col xs={ 4 }>
                                        <Card.Title>{this.state.question.answerCount}</Card.Title>
                                        <p className="mb-0">answers</p>
                                    </Col>
                                    <Col xs={ 4 }>
                                        <Card.Title>{this.state.question.viewCount}</Card.Title>
                                        <p className="mb-0">views</p>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className="mt-3">
                            <Col xs={ 9 }>
                            {
                                this.state.question.tags.map((tag: string, i: number) => {
                                    return (
                                        <TagComponent key={tag + i.toString()} text={ tag } />
                                    )
                                })
                            }
                            </Col>
                            <Col xs={ 3 } className="card-text text-right">
                                Posted by { this.state.question.user.username }
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Link>
        );
    }
}
