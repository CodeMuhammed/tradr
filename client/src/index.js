import React from 'react';
import ReactDOM from 'react-dom';
import MyRouter from './routes.js';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import './index.css';

ReactDOM.render(
  <MyRouter />,
  document.getElementById('root')
);
