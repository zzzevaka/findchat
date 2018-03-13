import React, {Component,} from 'react';
import {DropdownTools, DeletePostMenuItem} from '../Menu/dropdown-tools';
import {Link} from 'react-router-dom';
import {translate} from 'react-i18next';
import classNames from 'classnames';
import {pure} from 'recompose';
import TimeAgo from 'react-timeago';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import russianFormatter from 'react-timeago/lib/language-strings/ru';
import {PhotoSwipeImage} from '../PhotoSwipe';
import {CommentColorIcon} from '../Icons';
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
        const {thread, showPosts, placeholder, history, isMyPage, match, t, dispatch}= this.props;
        return (
            <div className='offer-thread'>
                <InfiniteThread {...this.props} />
                {
                    isMyPage && 
                        <center>
                            <Link
                                className='link-no-style button-new-post'
                                to={`${match.url}?modalType=new_chat_offer`}
                            >
                                <span>{t("Add new topic")}</span>
                            </Link>
                        </center>
                }
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

ChatOfferThread = translate('translations')(ChatOfferThread);

let OfferPostWrapper = pure(
    ({auth, ...props}) => {
        const answerLink = auth.authenticated
            ? props.history.location.pathname + `?modalType=chat_offer&postID=${props.post.id}`
            : '/login?showForm=1';
        return (
            <div className='post-offer-wrapper'>
                <OfferPost {...props} className='post-offer-item' />
                <div className='button-area'>
                    <Link
                        to={answerLink}
                        className='link-no-style button-answer'
                    >
                        <CommentColorIcon />
                        <span className='button-text'>{props.t("Answer")}</span>
                    </Link>
                </div>
            </div>
        );
    }
);

OfferPostWrapper = translate('translations')(OfferPostWrapper);
OfferPostWrapper = withAuth(OfferPostWrapper);

export {OfferPostWrapper}

let OfferPost = function({post, author, className, dispatch, auth}) {
    if (!author) return null;

    const classes = classNames(
        'post-item',
        {'post-item-deleted': post.status === 'deleted'},
        className
    );

    return (
        <div className={classes}>
            <div className='post-option'>
                <DropdownTools>
                    { auth.user_id === author.id && DeletePostMenuItem(post, dispatch) }
                </DropdownTools>
            </div>
            <Link className='link-no-style' to={`/user/${author.id}`}>
                <UserAvatar thumbnail={author.thumbnail} />
            </Link>
            <div className='post-header'>
                <Link className='link-no-style' to={`/user/${author.id}`}>
                    <span className='author-name'>{author.firstname}</span>
                </Link>
                <br />
                <PostTime datetime={post.datetime} />
            </div>
            <div className='post-body'>
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