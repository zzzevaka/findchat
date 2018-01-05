var React = require('react');
var ReactDOM = require('react-dom/server');
var Router = require('react-router-dom');
var Test = require('./test');


class Tset extends React.Component {
    render() {
        return (
            <div>test</div>
        );
    }
}


module.exports = function(app) {
    app.get('*', (req, res) => {
        const str = ReactDOM.renderToString(<div><Test /></div>);
        res.send(str);
    })
}