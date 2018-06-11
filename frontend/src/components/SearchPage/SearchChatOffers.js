import React, {Component} from 'react';
import { connect } from 'react-redux';
import {ChatOfferThread} from '../thread';
import {loadChatOffers} from '../../actions';

const OFFERS_THREAD = 'chat_offers';
const OFFER_PLACEHOLDER = 'Nothing found ;(';


class SearchChatOffers extends Component {

    loadOffers = (limit, offset, dispatch) => {
        dispatch(loadChatOffers(limit, offset, this.props.filter));
    };

    componentWillUpdate(nProps) {
        if (this.props.filter !== nProps.filter) {
            this.thread.getWrappedInstance().flush()
        }
    }

    render() {
        return (
            <ChatOfferThread
                wrappedComponentRef={e => this.thread = e}
                threadID={OFFERS_THREAD}
                filter={this.props.filter}
                loadMethod={this.loadOffers}
                placeholder={OFFER_PLACEHOLDER}
            />
        );
        
    }

}

function mapStateToProps(state) {
    return ({
        filter: state.searchFilter
    });
}

export default connect(mapStateToProps)(SearchChatOffers);