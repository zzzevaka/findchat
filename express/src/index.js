import express from 'express';
import React from 'react';
import { NotLoginMenu } from '../frontend/components/Menu';
import { renderToString } from 'react-dom/server';
import StaticRouter from 'react-router-dom/StaticRouter';



class Test extends React.Component {

  constructor() {
    super();
    this.state = {
      name: "Leo"
    }
  }

  componentDidMount() {
    alert('mounted')
  }

  componentWillReceiveProps() {
    alert('hi')
  }

  render() {
    return (
      <StaticRouter>
        <NotLoginMenu />
      </StaticRouter>
    );
  }

}



var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/test', (req, res) => {
  res.send(renderToString(<Test />));
})

app.listen(80, function () {
  console.log('Example app listening on port 80!');
});