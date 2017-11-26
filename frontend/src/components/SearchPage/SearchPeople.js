import React, {Component} from 'react';
import { connect } from 'react-redux';
import {UserThread} from '../thread';
import {findUsers} from '../../actions';

const USERS_THREAD = 'search_users';
const USERS_PLACEHOLDER = 'Nothing found ;(';

class SearchPage extends Component {

    componentWillUpdate(nProps) {
        if (this.props.filter !== nProps.filter) {
            this.thread.getWrappedInstance().flush()
        }
    }

    usersLoad = (limit, offset, dispatch) => {
        dispatch(findUsers(limit, offset, this.props.filter));
    }

    render() {
        return (
            <UserThread
                ref={e => this.thread = e}
                threadID={USERS_THREAD}
                filter={this.props.filter}
                loadMethod={this.usersLoad}
                placeholder={USERS_PLACEHOLDER}
            />
        );
    }

}

function mapStateToProps(state) {
    return ({
        filter: state.searchFilter
    });
}

export default connect(mapStateToProps)(SearchPage);