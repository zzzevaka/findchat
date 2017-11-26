import React, {Component, PureComponent} from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import {Image, Glyphicon} from 'react-bootstrap';
import {Link} from 'react-router';
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
import {getModalUrl} from '../../utils';
import currentUserId from '../../auth';

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
        const {thread, showMorePosts} = this.props;
        if (e.top <= 0.3 && thread.status !== 'loading') {
            showMorePosts();
        }
    }

    render() {
        console.warn('CHAT RENDERING');
        const {thread, showPosts, dispatch} = this.props;
        const member = thread.members ? thread.members[0] : undefined;
        return (
            <div className='chat-thread'>
            <div className='top-fixed-bar'>
                { member &&
                    <div className='chat-member-title'>
                        <Link
                            to={`/user/${member.id}`}
                            className='link-no-style'
                        >
                            <UserAvatar thumbnail={member.thumbnail} />
                            <span>{member.firstname}</span>
                        </Link>
                    </div>

                }
                <Link
                    to='/chats'
                    className='link-no-style link-to-chats'
                >
                    <img src='/svg/message.svg' />
                </Link>
            </div>
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

const ChatPost = pure(
    ({post, author, dispatch, className, ...rest}) => {
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
                        { currentUserId() == author.id && DeletePostMenuItem(post, dispatch) }
                    </DropdownTools>
                </div>
                <img
                    className='avatar'
                    src={`/img/${author.thumbnail || 'avatar-dummy.jpg'}`}
                />
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

export default connectThread(mapStateToProps, null, null, {withRef: true})(ChatThread);