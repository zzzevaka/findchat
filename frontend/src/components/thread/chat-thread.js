import React, {Component} from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import classNames from 'classnames';
import {pure} from 'recompose';

import connectThread, {mapStateToProps} from './connect-thread';
import {PhotoSwipeImage} from '../PhotoSwipe';
import {PostTime} from './offer-thread';
import ThreadPostComposer from '../PostComposer/ThreadPostComposer';
import {DropdownTools, DeletePostMenuItem} from '../Menu/dropdown-tools';
import {LoaderIcon} from '../Icons';
import {UserAvatar} from '../UserPage';

import {setThreadAsReaded} from '../../actions';
import {withAuth} from '../../auth';

const COMPOSER_PLACEHOLDER = 'Your message';

class ChatThread extends Component {

    componentDidMount() {
        this.checkUnreaded();
        this.scrollbar.scrollToBottom();
    }

    componentDidUpdate(pProps, pState) {
        // check scroll position
        if (this.offsetBottom) {
            this.scrollbar.scrollTop(this.scrollbar.getValues().scrollHeight - this.offsetBottom);
        }
        else {
            this.scrollbar.scrollToBottom();
        }
        // update unreaded posts
        this.checkUnreaded();
    }

    checkUnreaded = () => {
        const {thread, unreadedPosts, dispatch} = this.props;
        if (unreadedPosts) dispatch(setThreadAsReaded(thread.id));
    }

    _onScroll = (e) => {
        this.offsetBottom = e.scrollHeight - e.scrollTop;
    }

    render() {
        const {thread, showPosts, showMorePosts, dispatch} = this.props;
        return (
            <div className='chat-thread'>
            <Scrollbars
                ref = {e => this.scrollbar = e}
                className='post-list'
                onScrollFrame={this._onScroll}
                renderTrackHorizontal={() => <div style={{display:"none"}}/>}
            >
                {
                    thread.status === 'loading' && <div style={{
                        textAlign: 'center',
                        padding: '10px'
                    }}>
                        <LoaderIcon />
                    </div>
                }
                {
                    thread.status !== 'loading' && (!thread.no_more_posts || thread.posts.length >= showPosts) &&
                    <div className='button-show-more'>
                    <button onClick={showMorePosts} className='button-no-style'>
                        Load more
                    </button>
                    </div>
                }
                {
                    thread.posts.slice(0, showPosts).reverse().map(
                        (p, id) => {
                            return (
                                <ChatPost
                                    key={p.post.id}
                                    post={p.post}
                                    author={p.author}
                                    dispatch={dispatch}
                                    className={id === 0 && 'post-item-first'}
                                />
                            );
                        }
                    )
                }
            </Scrollbars>
            <ThreadPostComposer
                threadID={thread.id}
                placeholder={COMPOSER_PLACEHOLDER}
            />
            </div>
        );
    }

}


const imgHeightToAuto = e => e.target.style.height = 'auto'

let ChatPost = pure(
    ({post, author, dispatch, className, auth, ...rest}) => {
        if (!author) return null;
        const classes = classNames(
            className,
            'post-item',
            'post-chat-item',
            {'post-item-deleted': post.status === 'deleted'}
        );
        return (
            <div className={classes}>
                <div className='post-option'>
                    <DropdownTools>
                        { auth.user_id === author.id && DeletePostMenuItem(post, dispatch) }
                    </DropdownTools>
                </div>
                <UserAvatar thumbnail={author.thumbnail} />
                <span className='author-name'>{author.firstname}</span>
                <br />
                <PostTime datetime={post.datetime} />
                {
                    post.content && true && 
                        <PhotoSwipeImage
                            className='post-content'
                            src={`/img/${post.content.full}`}
                            w={post.content.width}
                            h={post.content.height}
                            msrc={`/img/${post.content.preview}`}
                            alt={post.text}
                            style={{height: '250px'}}
                            onLoad={imgHeightToAuto}
                        />
                }
                {
                    post.text && <p className='post-text' dangerouslySetInnerHTML={{__html: post.text}} />
                }
            </div>
        );
    }
);

ChatPost = withAuth(ChatPost);

export default connectThread(mapStateToProps, null, null, {withRef: true})(ChatThread);