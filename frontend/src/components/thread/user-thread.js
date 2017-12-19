import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import classNames from 'classnames';
import {UserAvatar} from '../UserPage';

import connectThread, {mapStateToPropsUsers} from './connect-thread';


class UserThread extends Component {

    _onScroll = e => {
        if ((window.innerHeight + window.scrollY) / document.body.offsetHeight > 0.8) {
            const {thread, showMorePosts} = this.props;
            if (thread.status !== 'loading') showMorePosts();
        }
        
    }

    componentDidMount() {
        window.addEventListener('scroll', this._onScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this._onScroll);
    }

    render() {
        const {thread, showPosts, placeholder, dispatch} = this.props;
        return (
            <div className='user-thread'>
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
            </div>
        );
    }

}

export function UserThreadItem({user}) {
    if (!user) return null;
    return (
        <Link
            to={`/user/${user.id}`}
            className='link-no-style post-item post-user-item'
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
    )
}

export default connectThread(mapStateToPropsUsers, null, null, {withRef: true})(UserThread);