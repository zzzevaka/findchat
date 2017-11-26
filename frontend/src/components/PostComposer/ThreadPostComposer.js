import React, {Component, PureComponent} from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {addPost} from '../../actions';

import PostComposer from './index';
import {closeModal} from '../../utils';


function getComposerIdByThread(threadID) {
    return `thread${threadID}`;
}


class ThreadPostComposer extends PureComponent {

    _onSubmit = post => {
        const {addPost, threadID, onSubmit} = this.props;
        addPost(
            {thread_id: threadID, ...post},
            getComposerIdByThread(threadID)
        );
        onSubmit && onSubmit();
    }

    render() {
        const {threadID, addPost, ...rest} = this.props;
        return (
            <PostComposer
                {...rest}
                ref = {e => this.composerInstance = e}
                id={getComposerIdByThread(threadID)}
                onSubmit={this._onSubmit}
            />
        );
    }

    getWrappedComposer() {
        if (!this.composerInstance) return null;
        return this.composerInstance.getWrappedInstance();
    }
}


function mapStateToProps() {
    return {};
}

function mapDispatchToProps(dispatch) {
    return {
        addPost: bindActionCreators(addPost, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})(ThreadPostComposer);
