import React, {Component} from 'react';
import {loadChats} from '../../actions';
import {ChatListThread} from '../thread';

const CHAT_LIST_THREAD = 'chat_list';
const CHAT_LIST_PLACEHOLDER = 'Threre are no chats yet ;(';

export default class ChatList extends Component {

    chatListLoad = (limit, offset, dispatch) => {
        dispatch(loadChats(limit, offset));
    }

    render() {
        return (
            <ChatListThread
                threadID={CHAT_LIST_THREAD}
                placeholder={CHAT_LIST_PLACEHOLDER}
                loadMethod={this.chatListLoad}
                flushOnUnmount
            />
        );
    }
}