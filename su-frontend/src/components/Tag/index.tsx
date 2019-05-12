import * as React from 'react';
import { Badge } from 'react-bootstrap';

import './tag.css';

export class TagComponent extends React.PureComponent {

    public readonly props: any;
    public readonly state: {
        text: ''
    }

    constructor(props: any) {
        super(props);
    }

    public componentWillMount() {
        this.setState({
            text: this.props.text
        });
    }

    public render() {
        return (
            <Badge className="tag" variant="primary">
                <span>{ this.state.text }</span>
            </Badge>
        )
    }
}