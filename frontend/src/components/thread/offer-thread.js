import React, {Component, PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Image, Glyphicon} from 'react-bootstrap';
import {DropdownTools, DeletePostMenuItem} from '../Menu/dropdown-tools';
import {browserHistory, Link} from 'react-router';
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
import currentUserId from '../../auth';
import {getModalUrl} from '../../utils';

import './offer-thread.css';


const FORMATTER = buildFormatter(russianFormatter);


class ChatOfferThread extends Component {

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
        const {thread, showPosts, placeholder, dispatch}= this.props;
        return (
            <div className='offer-thread'>
                { thread.posts.slice(0, showPosts).map(p => <OfferPostWrapper {...p} key={p.post.id} dispatch={dispatch} />) }
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

export const OfferPostWrapper = pure(  
    (props) => {
        return (
            <div className='post-offer-wrapper'>
                <OfferPost {...props} />
                <div className='button-area'>
                    <Link
                        to={getModalUrl(`modalType=chat_offer&postID=${props.post.id}`)}
                        className='link-no-style button-answer'>
                        <CommentColorIcon />
                        <span className='button-text'>ANSWER</span>
                    </Link>
                </div>
            </div>
        );
    }
);

export const OfferPost = ({post, author, dispatch}) => {
    if (!author) return null;

    const classes = classNames(
        'post-item',
        'post-offer-item',
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
            <span className='author-name'>{author.firstname}</span>
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