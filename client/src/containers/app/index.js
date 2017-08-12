import React, { Component } from 'react';
import { TypeChooser } from 'react-stockcharts/lib/helper';
import Chart from './chart';

class App extends Component {
    render () {
        return (
        <TypeChooser>
            {type => <Chart type={type} data={this.props.data} />}
        </TypeChooser>
        )
    }
}

export default App;
