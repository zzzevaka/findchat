import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import classNames from 'classnames';
import {ThreadLoaderIcon, ThreadPlaceholder, InfiniteThread} from './thread-interface';
import {UserAvatar} from '../UserPage';
import InfiniteScroll from '../infinite-scroll';
import {followUser, unfollowUser} from '../../actions';

import connectThread, {mapStateToPropsUsers} from './connect-thread';


class UserThread extends Component {

    render() {
        const {thread, showPosts, placeholder, dispatch} = this.props;
        return (
            <div className='user-thread'>
                <InfiniteThread {...this.props} />
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
                <ThreadLoaderIcon thread={thread} />
                <ThreadPlaceholder thread={thread} placeholder={placeholder} />
            </div>
        );
    }

}

function UserThreadItem({user, match, dispatch}) {
    if (!user) return null;
    return (
        <div className='post-item post-user-item'>
            <Link
                to={`/user/${user.id}`}
                className='link-no-style'
            >
                <UserAvatar thumbnail={user.thumbnail} />
                <span className='author-name'>{user.firstname}</span>
                <br />
                <span className='lang'>
                {
                    user.lang && user.lang.join(', ')
                }
                </span>
                <br />
                <div className='hashtags'>
                {
                    user.hashtags && user.hashtags.map(v => <span key={v} className='hashtag'>{`#${v}`}</span>)
                }
                </div>
            </Link>
            <div className='buttons'>
                {
                    user.current_user_follows
                        ? <button
                            className='button-no-style button'
                            onClick={() => dispatch(unfollowUser(user.id)) }
                        >Unfollow</button>
                        : <button
                            className='button-no-style button'
                            onClick={() => dispatch(followUser(user.id)) }
                        >Follow</button>
                }
                <Link
                    to={`${match.url}?modalType=private_message_composer&userID=${user.id}`}
                    className='link-no-style button'
                >Message</Link>
            </div>
        </div>
    )
}

UserThreadItem = withRouter(UserThreadItem);

export {UserThreadItem};

export default connectThread(mapStateToPropsUsers, null, null, {withRef: true})(UserThread);