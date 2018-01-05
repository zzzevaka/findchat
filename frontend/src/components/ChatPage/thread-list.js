import React, {Component} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Scrollbars } from 'react-custom-scrollbars';
import {loadChats} from '../../actions';
import getCurrentUserId from '../../auth';
// import connectThread, {mapStateToPropsChatList} from '../thread/connect-thread';
import {ChatListThread} from '../thread';

const CHAT_LIST_THREAD = 'chat_list';
const CHAT_LIST_PLACEHOLDER = 'Threre are no chats yet ;(';

export default class ChatList extends Component {

    // componentDidMount() {
    //     this.props.actions.loadChats();
    // }

    // componentDidUpdate(pProps) {
    //     const {unreadedPosts, actions} = this.props;
    //     if (pProps.unreadedPosts !== unreadedPosts) {
    //         actions.loadChats();
    //     }
    // }

    chatListLoad = (limit, offset, dispatch) => {
        dispatch(loadChats(limit, offset));
    }

    render() {
        const {chats} = this.props;
        return (
            <ChatListThread
                threadID={CHAT_LIST_THREAD}
                placeholder={CHAT_LIST_PLACEHOLDER}
                loadMethod={this.chatListLoad}
                flushOnUnmount
            />
            // <Scrollbars className='chat-list'>
            // {
            //     chats.map(c => <ChatListItem key={c.id} chat={c} />)
            // }
            // </Scrollbars>

        );
    }

}

// export function ChatListItem({chat}) {
//     if (!chat.member) return null;
//     return (
//         <Link className='chat-list-item link-no-style' activeClassName='chat-list-item-active' to={`/chats/${chat.id}`}>
//             <img className='avatar' src={`/img/${chat.member.thumbnail || 'avatar-dummy.jpg'}`} />
//             <p>
//                 <span className='author-name'>{chat.member.firstname}</span>
//                 <br />
//                 <span className='last-post' dangerouslySetInnerHTML={{__html: chat.lastPost.text || '...'}} />
//             </p>
//         </Link>
//     );
// }

// export default connectThread(mapStateToPropsChatList)(ChatList);

// function mapStateToProps({threads, posts, users, unreadedPosts}) {
//     const sortedChatsID = [...threads.chatsID].sort((a,b) => {
//         return Number(threads[a].posts[0]) < Number(threads[b].posts[0]) ? 1 : -1
//     });
//     let chats = sortedChatsID.map(id => ({
//         ...threads[id],
//         member: users[threads[id].members[0] || getCurrentUserId()],
//         lastPost: posts[threads[id].posts[0]]
//     }));
//     return {
//         chats: chats,
//         unreadedPosts: unreadedPosts
//     };
// }

// function mapActionsToProps(dispatch) {
//     return {
//         actions: bindActionCreators(Actions, dispatch)
//     }
// }

// export default connect(mapStateToProps, mapActionsToProps)(ChatList);


