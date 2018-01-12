import {Component} from 'react';
import PropTypes from 'prop-types';

export default class InfiniteScroll extends Component {
    
    static propTypes = {
        loadMethod: PropTypes.func.isRequired,
        loadThreshold: PropTypes.number.isRequired,
    }

    static defaultProps = {
        loadMethod: () => {},
        loadThreshold: 0.8,
    }

    _onScroll = e => {
        const {loadThreshold, loadMethod} = this.props;
        if ((window.innerHeight + window.scrollY) / document.body.offsetHeight > loadThreshold) {
            loadMethod();
        }
        
    }

    componentDidMount() {
        window.addEventListener('scroll', this._onScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this._onScroll);
    }

    render() {
        return null;
    }

}