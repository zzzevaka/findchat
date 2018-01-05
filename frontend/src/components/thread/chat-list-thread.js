import React, {Component} from 'react';
import {NavLink} from 'react-router-dom';
import { Scrollbars } from 'react-custom-scrollbars';
import connectThread, {mapStateToPropsChatList} from './connect-thread';
import {ThreadLoaderIcon, ThreadPlaceholder} from './thread-interface';
import {UserAvatar} from '../UserPage';


class ChatListThread extends Component {

    _onScroll = (e) => {
        const {thread, showMorePosts} = this.props;
        if (e.top >= 0.8 && thread.status !== 'loading') {
            showMorePosts();
            // alert('need more chats');
        }
    }

    render() {
        const {thread, showPosts, placeholder, unreadedPosts, dispatch}= this.props;
        return (
            <Scrollbars
                className='chat-list'
                onScrollFrame={this._onScroll}
            >
                {
                    thread.posts.slice(0, showPosts).map(chat => 
                        <ChatListItem
                            unreadedPosts={unreadedPosts.threads[chat.id]}
                            chat={chat}
                            key={chat.id}
                            dispatch={dispatch}
                        />
                    )
                }
                <ThreadLoaderIcon thread={thread} />
                <ThreadPlaceholder thread={thread} placeholder={placeholder} />
            </Scrollbars>
        );
    }

}

const ChatListItem = ({chat, unreadedPosts}) => {
    if (!chat.member) return null;
    return (
        <NavLink className='chat-list-item link-no-style' activeClassName='chat-list-item-active' to={`/chats/${chat.id}`}>
            <UserAvatar thumbnail={chat.member.thumbnail }/>
            <p>
                <span className='author-name'>{chat.member.firstname}</span>
                <br />
                <span className='last-post' dangerouslySetInnerHTML={{__html: chat.lastPost.text || '...'}} />
                {
                    Boolean(unreadedPosts) &&
                        <span className='unreaded-posts'>{unreadedPosts}</span>
                }
            </p>
        </NavLink>
    );
}

export default connectThread(mapStateToPropsChatList, null, null, {withRef: true})(ChatListThread);
