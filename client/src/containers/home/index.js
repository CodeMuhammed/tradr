import React, { Component } from 'react';
import axios from 'axios';
import App from '../app';

class Home extends Component {
    constructor (props) {
        super(props);
        this.state = {
            data: [],
            isLoading: true
        };
    }

    componentDidMount () {
        axios.get('http://stocktradr.herokuapp.com', {
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        })
        .then((response) => {
            if (response.statusText === 'OK') {
                console.log(response.data);
                this.setState({
                    data: response.data,
                    isLoading: false
                });
            }
        })
        .catch(() => {
            console.log('Cannot load datasets');
        });
    }

    renderApp () {
        let result = <div>Loading...</div>;
        if (!this.state.isLoading) {
            result = <App data={this.state.data}/>
        }
        return result;
    }

    render () {
        return (
            <div>
                {this.renderApp()}
            </div>
        )
    }
}

export default Home;
