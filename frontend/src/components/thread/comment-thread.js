import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Image} from 'react-bootstrap';
import { Scrollbars } from 'react-custom-scrollbars';
import {Link} from 'react-router';

import {DropdownTools, DeletePostMenuItem} from '../Menu/dropdown-tools';
import connectThread, {mapStateToProps} from './connect-thread';
import {PostTime} from './offer-thread';
import {UserAvatar} from '../UserPage';

import currentUserId from '../../auth';

import './comment-thread.css';


function CommentThread({thread, dispatch, showMorePosts, ...rest}) {
    return (
        <div {...rest}>
        {
            thread.posts.map(p => <CommentPost key={p.post.id} post={p.post} author={p.author} dispatch={dispatch}/>)
        }
        </div>
    );
}


export function CommentPost(props) {
    const {post, author, dispatch} = props;
    // if (!author) return null;

    const classes = classNames(
        'post-item',
        'post-comment-item',
        {'post-item-deleted': post.status === 'deleted'}
    );

    return (
        <div className={classes}>
            <div className='post-option'>
                <DropdownTools>
                    { currentUserId() == author.id && DeletePostMenuItem(post, dispatch) }
                </DropdownTools>
            </div>
                <UserAvatar thumbnail={author.thumbnail} />
                <Link
                    to={`/user/${author.id}`}
                    className='link-no-style'
                >
                    <p className='author-name'>
                        <span>{author.firstname}</span>
                        <PostTime datetime={post.datetime} />
                    </p>
                </Link>
                <p className='post-text' dangerouslySetInnerHTML={{__html: post.text}} />
        </div>
    )
}


export default connectThread(mapStateToProps)(CommentThread);