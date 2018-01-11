import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {getCookie} from './utils';
import {connect} from 'react-redux';
import {getAuth} from './actions';

// export function currentUserId() {
//     return getCookie('current_user_id');
// }

const  DefaultComponent = () => null;

export function loginRequired(WrappedComponent, ComponentIFNotLogin=DefaultComponent) {

    return withAuth(function(props) {
        return props.auth.authenticated
            ? <WrappedComponent {...props} />
            : <ComponentIFNotLogin />
    })

}

class AuthProvider extends Component {

    static propTypes = {
        wait: PropTypes.bool.isRequired,
    }

    static defaultProps = {
        wait: true,
    }

    loadData = () => this.props.dispatch(getAuth())

    componentDidMount() {
        this.loadData();
    }

    render() {
        const {auth, wait} = this.props;
        if (auth.authenticated == undefined && wait) {
            return null;
        }
        return this.props.children;
    }
}

const withAuth = connect(state => ({auth: state.auth}));

export {withAuth};

export default connect(state => ({
    auth: state.auth,
    dispatch: state.dispatch
}))(AuthProvider);