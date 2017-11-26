import React, {Component} from 'react';
import {browserHistory, Link} from 'react-router';
import classNames from 'classnames';
import {pure} from 'recompose';
import { Scrollbars } from 'react-custom-scrollbars';
import {DropdownTools, DeletePostMenuItem, SetAsAvatarMenuItem} from '../Menu/dropdown-tools';
import {PhotoSwipeImage} from '../PhotoSwipe';
import {LoaderIcon} from '../Icons';
import {UserAvatar} from '../UserPage';
import {PostTime} from './offer-thread';
import connectThread, {mapStateToProps} from './connect-thread';

import {getModalUrl} from '../../utils';
import currentUserId from '../../auth';

import './photo-thread.css';


class PhotoThread extends Component {

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
            <div className='photo-thread'>
                {
                    thread.posts.slice(0, showPosts).map(p => <PhotoThreadItem {...p} key={p.post.id} dispatch={dispatch} />)
                }
                {
                    thread.status === 'loading' && <div style={{
                        textAlign: 'center',
                        padding: '10px'
                    }}>
                        <LoaderIcon />
                    </div>
                }
                {
                    thread.status === 'loaded' && !thread.posts.length &&
                        <p className='thread-placeholder'>
                            {placeholder}
                        </p>
                }
            </div>
        );

    }

}


const PhotoThreadItem = pure(
    ({post, author, dispatch}) => {
        if (!author) return null;
        if (!post.content) return null;

        const classes = classNames(
            'post-item',
            'link-no-style',
            'post-photo-item',
            {'post-item-deleted': post.status === 'deleted'}
        );

        return (
            <div
                className={classes}
            >
                <div className='post-content-wrapper'>
                    <PhotoSwipeImage
                        className='post-content'
                        src={`/img/${post.content.full}`}
                        w={post.content.width}
                        h={post.content.height}
                        msrc={`/img/${post.content.preview}`}
                        alt={post.text}
                    />
                </div>
                <UserAvatar thumbnail={author.thumbnail} />
                <div className='post-footer'>
                    <PostTime datetime={post.datetime} />
                    <div className='post-option'>
                        <DropdownTools>
                            { currentUserId() == author.id && DeletePostMenuItem(post, dispatch) }
                            { currentUserId() == author.id && SetAsAvatarMenuItem(post, dispatch) }
                        </DropdownTools>
                    </div>
                </div>
            </div>
        )        
    }
);

export default connectThread(mapStateToProps)(PhotoThread);