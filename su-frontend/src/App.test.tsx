import * as React from 'react';
import { CookiesProvider } from "react-cookie";
import * as ReactDOM from 'react-dom';
import App from './App';

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
        <CookiesProvider>
            <App />
        </CookiesProvider>,
        div
    );
    ReactDOM.unmountComponentAtNode(div);
});
