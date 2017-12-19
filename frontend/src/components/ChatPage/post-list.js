import React, {PureComponent} from 'react';
import {ChatThread} from '../thread';
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