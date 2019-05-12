import * as React from 'react';
import axios from 'axios';
import { Redirect } from 'react-router';

class RedirectContainer extends React.Component {
    public readonly props: any;
    public readonly state: any;

    constructor(props: any) {
        super(props);
        this.state = {
            shouldRedirect: false
        };
    }

    public async componentDidMount () {
        this.setState({
            shouldRedirect: true
        });
    }

    public render() {
        const redirect = this.state.shouldRedirect ? (
            <Redirect to={`/_search?q=${this.props.match.params.query}`} />
        ) : null;

        // TODO: Convert object
        return (
            <div>
                {redirect}
            </div>
        )
    }

    public reloadAnswers() {
        this.forceUpdate();
    }
}

export default RedirectContainer;