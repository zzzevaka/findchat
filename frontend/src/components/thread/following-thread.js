import React from 'react';
import connectThread, {mapStateToPropsUsers} from './connect-thread';
import { UserThreadItem } from './user-thread';
import {ThreadLoaderIcon, ThreadPlaceholder, InfiniteThread} from './thread-interface';

function UserFollowingThread(props) {
    const {
        thread,
        showPosts,
        dispatch
    } = props;
    return (
        <div className='user-follow-thread'>
            <InfiniteThread {...props} />
            {
                thread.posts.slice(0, showPosts).map(
                    user => user
                        ? <UserThreadItem
                                user={user}
                                key={user.id}
                                dispatch={dispatch}
                            />
                        : null
                )
            }
            <ThreadLoaderIcon {...props} />
            <ThreadPlaceholder {...props} />
        </div>
    );
}

export default connectThread(
                    mapStateToPropsUsers,
                    null, null, {withRef: true}
               )(UserFollowingThread);