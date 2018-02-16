import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import {loadThread, flushThread} from '../../actions';
import { createSelector } from 'reselect';

let ConnectedThread = WrappedComponent => {

    return class extends Component {
        
        static propTypes = {
            threadID: PropTypes.oneOfType([
                    PropTypes.string,
                    PropTypes.number,
                ]).isRequired,
            thread: PropTypes.object,
            postsOnPage: PropTypes.number.isRequired,
            postsPreload: PropTypes.number.isRequired,
            loadMethod: PropTypes.func.isRequired,
            flushOnUnmount: PropTypes.bool
        }

        static defaultProps = {
            postsOnPage: 20,
            postsPreload: 20,
            subscribeThread: false,
            loadMethod: loadThread,
            flushOnUnmount: false
        }

        constructor(props) {
            super(props);
            const {postsOnPage} = props;
            this.state = {showPosts: postsOnPage};
        }

        componentDidMount() {
            this._loadThread();
        }

        componentWillUnmount() {
            if (this.props.flushOnUnmount) this.flush()
        }

        componentDidUpdate(pProps, pState) {
            const {thread} = this.props;
            if (!thread) return;
            if (pState.showPosts < this.state.showPosts || thread.status === 'flushed') {
                this._loadThread();
            }
        }

        _loadThread = () => {
            const {
                dispatch,
                thread,
                loadMethod,
                postsPreload
            } = this.props;
            const mustBeLoaded = this.state.showPosts + postsPreload;
            if (thread) {
                if (thread.posts.length < mustBeLoaded && !thread.no_more_posts) {
                    loadMethod(
                        mustBeLoaded,
                        thread.posts.length,
                        dispatch
                    );
                }
            }
            else {
                loadMethod(mustBeLoaded, 0, dispatch);
            }
        }

        flush = () => {
            const {dispatch, threadID, postsOnPage} = this.props;
            dispatch(flushThread([threadID,]));
            this.setState({showPosts: postsOnPage});
        }

        showMorePosts = () => { 
            const {thread, postsOnPage} = this.props;
            if (thread.no_more_posts && this.state.showPosts >= thread.posts.length) return;
            this.setState({
                showPosts:  this.state.showPosts + postsOnPage
            });
        }

        render() {
            const {
                thread,
                threadID,
                postsOnPage,
                postsPreload,
                loadMethod,
                placeholder,
                t,
                ...rest
            } = this.props;
            if (!thread) return null;
            const noMorePosts = thread.no_more_posts && this.state.showPosts >= thread.posts.length;
            return (
                <WrappedComponent
                    showPosts={this.state.showPosts}
                    showMorePosts={this.showMorePosts}
                    noMorePosts={noMorePosts}
                    thread={thread}
                    placeholder={t(placeholder)}
                    {...rest}
                />
            )
        }

    }

}

// ConnectedThread = translate('translations')(ConnectedThread);

export default function connectThread() {

    return WrappedComponent => translate('translations')(withRouter(connect.apply(null, arguments)(
        ConnectedThread(WrappedComponent)
    )));

}

const threadPostSelector = createSelector(
    [
        (state, thread) => thread,
        (state, thread) => state.users,
        (state, thread) => state.posts,
        (state, thread) => state.auth,
    ],
    (thread, users, posts, auth) => ({
        ...thread,
        members: [users[ thread.members && thread.members.length ? thread.members[0] : auth.user_id],],
        posts: thread.posts.map(pID => {
            return {
                post: posts[pID],
                author: users[posts[pID].author_id]
            }
        })
    })
);

const threadUsersSelector = createSelector(
    [
        (state, thread) => thread,
        (state, thread) => state.users,
    ],
    (thread, users) => ({
        ...thread,
        posts: thread.posts.map(uID => users[uID])
    })
);

const threadChatListSelector = createSelector(
    [
        (state, thread) => thread,
        (state, thread) => state.threads,
        (state, thread) => state.posts,
        (state, thread) => state.users,
        (state, thread) => state.auth,
    ],
    (thread, threads, posts, users, auth) => {
        return {
            ...thread,
            posts: thread.posts.map(id => ({
                ...threads[id],
                member: users[threads[id].members[0] || auth.user_id],
                lastPost: posts[threads[id].posts[0]]
            })).sort((a,b) => {
                return Number(a.posts[0]) < Number(b.posts[0]) ? 1 : -1
            })
        }
    }

);

export function mapStateToPropsUsers(state, {threadID}) {
    const t = state.threads[threadID];
    return {
        dispatch: state.dispatch,
        thread: t ? threadUsersSelector(state, t) : undefined,
    };
}

export function mapStateToPropsChatList(state, {threadID}) {
    const t = state.threads[threadID];
    return {
        dispatch: state.dispatch,
        thread: t ? threadChatListSelector(state, t) : undefined,
        unreadedPosts: state.unreadedPosts
    };
}

export function mapStateToProps(state, {threadID}) {
    const t = state.threads[threadID];
    return {
        dispatch: state.dispatch,
        thread: t ? threadPostSelector(state, t) : undefined,
        unreadedPosts: state.unreadedPosts.threads[threadID],
    };
}