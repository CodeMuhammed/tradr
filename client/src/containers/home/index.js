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
        let url = this.getDataUrl();
        console.log(url);
        axios.get(url, {
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        })
        .then((response) => {
            if (response.statusText === 'OK') {
                console.log('Here');
                let data = this.formatData(response.data);
                this.setState({
                    data: data,
                    isLoading: false
                });
            }
        })
        .catch(() => {
            console.log('Cannot load datasets');
        });
    }

    formatData (data) {
        data.map(() => {
            return {
                high: data.high,
                low: data.low,
                open: data.open,
                close: data.close,
                volume: data.volume,
                date: this.formatDate(data.timestamp)
            };
        });

        return data;
    }

    formatDate (timestamp) {
        console.log(new Date(timestamp));
    }

    getDataUrl () {
        if (window.location.href.indexOf('localhost') >= 0) {
            return 'http://localhost:8001/data';
        }
        return 'http://stocktradr.herokuapp.com/data';
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
