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
import PostComposer from '../PostComposer';
import {
    VKShareButton,
    VKIcon,

    FacebookShareButton,
    FacebookIcon,

    OKShareButton,
    OKIcon,


} from 'react-share';


import { answerChatOffer } from '../../actions';
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





let SharePostComposer = ({ post, ...rest }) => {
    const postUrl = `https://findchat.io/post/${post.id}`;
    const iconSize = 32;
    const title = 'Новая тема на findchat.io'
    return (
        <div { ...rest } className="post-offer-wrapper__share">
            <VKShareButton
                title={ title }
                desciption={ post.text }
                url={ `https://findchat.io/posts/` }
            >
                <VKIcon size={iconSize} round />
            </VKShareButton>
            <FacebookShareButton
                title={ title }
                desciption={ post.text }
                url={ '/lala/' }
            >
                <FacebookIcon size={iconSize} round />
            </FacebookShareButton>
            <OKShareButton
                title={ title }
                desciption={ post.text }
                url={ '/lala/' }
            >
                <OKIcon size={iconSize} round />
            </OKShareButton>
        </div>
    );
};


let OfferPostWrapper = pure(
    ({auth, ...props}) => {
        const handleSubmit = p => props.dispatch(answerChatOffer(props.post.id, p));
        return (
            <div className='post-offer-wrapper'>
                <OfferPost {...props} className='post-offer-item' />
                {
                    auth.authenticated
                        ? auth.user_id !== props.post.author_id
                            ? <PostComposer
                                id={ `offer_${props.post.id}` }
                                onSubmit={ handleSubmit }
                                placeholder='Ответить в личном сообщении'
                            />
                            : <SharePostComposer
                                post={ props.post }
                            />
                        : <div className="post-offer-wrapper__login-link">
                            <Link className="link-no-style" to="/login?showForm=1">
                                Войдите, чтобы ответить
                            </Link>
                        </div>
                }

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