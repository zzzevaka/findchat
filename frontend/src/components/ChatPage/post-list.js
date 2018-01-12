import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {ChatThread} from '../thread';
import {UserPageTopFixedBar} from '../UserPage';
import {loadThread} from '../../actions';

export default class ChatPostList extends PureComponent {

    loadMethod = (limit, offset, dispatch) => dispatch(
        loadThread(this.props.match.params.threadID, limit, offset)
    )

    render() {
        const {params} = this.props.match;
        const threadID = params ? params.threadID : null;
        return (
            <div className='chat-post-list' key={`chat_${threadID || 'empty'}`}>
                { threadID &&
                    <ChatThread
                        threadID={Number(threadID)}
                        loadMethod={this.loadMethod}
                    />
                }
                { !threadID &&
                    <div className='chat-dummy'>
                        <span>It's just dummy</span>
                    </div>
                }
            </div>
        );
    }
}


let ChatTopFixedBar = function({userID}) {
    return (
        <UserPageTopFixedBar userID={userID}>
            <Link
                to='/chats'
                className='link-no-style link-to-chats'
            >
                <img src='/svg/message.svg' alt='' />
            </Link>
        </UserPageTopFixedBar>
    );
}

function mapStateToProps(state, {match}) {
    const {threadID} = match.params;
    const thread = state.threads[threadID];
    let member = undefined;
    if (thread && thread.members) {
        member = thread.members[0];
    }
    return {
        userID: member
    }
}

ChatTopFixedBar = connect(mapStateToProps)(ChatTopFixedBar);

export {ChatTopFixedBar};