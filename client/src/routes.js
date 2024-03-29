import React, { Component } from 'react';

import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom';

import Home from './containers/home';

class MyRouter extends Component {
    render () {
        return (
            <Router>
                <div>
                    <Route exact path="/" component={Home}/>
                </div>
            </Router>
        )
    }
}

export default MyRouter;
