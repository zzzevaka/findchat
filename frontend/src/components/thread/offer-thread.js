import React, {Component, PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Image, Glyphicon} from 'react-bootstrap';
import {DropdownTools, DeletePostMenuItem} from '../Menu/dropdown-tools';
import {withRouter, Link} from 'react-router-dom';
import classNames from 'classnames';
import {pure} from 'recompose';
import TimeAgo from 'react-timeago';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import russianFormatter from 'react-timeago/lib/language-strings/ru';
import {PhotoSwipeImage} from '../PhotoSwipe';
import {LoaderIcon, CommentColorIcon} from '../Icons';
import {UserAvatar} from '../UserPage';
import {HashtagString} from '../Hashtag';
import connectThread, {mapStateToProps} from './connect-thread';
import {ThreadLoaderIcon, ThreadPlaceholder, InfiniteThread} from './thread-interface';

import {withAuth} from '../../auth';

import './offer-thread.css';


const FORMATTER = buildFormatter(russianFormatter);


class ChatOfferThread extends Component {

    _loadMethod = () => {
        const {thread, showMorePosts} = this.props;
        if (thread.status !== 'loading') showMorePosts();
    }

    render() {
        const {thread, showPosts, placeholder, history, dispatch}= this.props;
        return (
            <div className='offer-thread'>
                <InfiniteThread {...this.props} />
                {
                    thread.posts.slice(0, showPosts).map(p => 
                        <OfferPostWrapper
                            history={history}
                            key={p.post.id}
                            {...p}
                            dispatch={dispatch}
                        />
                    )
                }
                <ThreadLoaderIcon thread={thread} />
                <ThreadPlaceholder thread={thread} placeholder={placeholder} />
            </div>
        );
    }

}

export const OfferPostWrapper = pure(
    (props) => {
        return (
            <div className='post-offer-wrapper'>
                <OfferPost {...props} />
                <div className='button-area'>
                    <Link
                        to={props.history.location.pathname + `?modalType=chat_offer&postID=${props.post.id}`}
                        className='link-no-style button-answer'>
                        <CommentColorIcon />
                        <span className='button-text'>ANSWER</span>
                    </Link>
                </div>
            </div>
        );
    }
);

function OfferPost({post, author, className, dispatch, auth}) {
    if (!author) return null;

    const classes = classNames(
        'post-item',
        'post-offer-item',
        {'post-item-deleted': post.status === 'deleted'},
        className
    );

    return (
        <div className={classes}>
            <div className='post-option'>
                <DropdownTools>
                    { auth.user_id == author.id && DeletePostMenuItem(post, dispatch) }
                </DropdownTools>
            </div>
            <Link className='link-no-style' to={`/user/${author.id}`}>
            <UserAvatar thumbnail={author.thumbnail} />
            <span className='author-name'>{author.firstname}</span>
            </Link>
            <br />
            <PostTime datetime={post.datetime} />
            {
                post.content && <PhotoSwipeImage
                    className='post-content'
                    src={`/img/${post.content.full}`}
                    w={post.content.width}
                    h={post.content.height}
                    msrc={`/img/${post.content.preview}`}
                    alt={post.text}
                />
            }
            {
                post.text && <p className='post-text' dangerouslySetInnerHTML={{__html: HashtagString(post.text)}} />
            }            
        </div>
    );
};

OfferPost = withAuth(OfferPost);

export {OfferPost};

export function PostTime({datetime}) {
    return (
        <TimeAgo
            date={datetime}
            formatter={FORMATTER}
            className='post-time'
        />
    );
}

export default connectThread(mapStateToProps, null, null, {withRef: true})(ChatOfferThread);