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
        axios.get(url, {
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        })
        .then((response) => {
            if (response.statusText === 'OK') {
                let data = this.formatData(response.data.msg).slice(0, 300);

                this.setState({
                    data: data,
                    isLoading: false
                });
            }
        })
        .catch((e) => {
            console.log(e);
        });
    }

    formatData (data) {
        return data.map((item) => {
            return {
                high: item.high,
                low: item.low,
                open: item.open,
                close: item.close,
                volume: item.volume,
                date: this.formatDate(item.timestamp)
            };
        });
    }

    formatDate (timestamp) {
        timestamp = timestamp * 1000;
        return new Date(timestamp);
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
