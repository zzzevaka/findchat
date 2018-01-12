import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {MenuItem} from 'react-bootstrap';
import classNames from 'classnames';
import {pure} from 'recompose';
import {DropdownTools, DeletePostMenuItem} from '../Menu/dropdown-tools';
import {PhotoSwipeImage} from '../PhotoSwipe';
import {UserAvatar} from '../UserPage';
import {PostTime, OfferPost} from './offer-thread';
import connectThread, {mapStateToProps} from './connect-thread';
import {ThreadLoaderIcon, ThreadPlaceholder, InfiniteThread} from './thread-interface';

import {updateUser} from '../../actions';

import './photo-thread.css';


import ImageUploader from '../upload-image';


class PhotoThread extends Component {
    
    render() {
        const {thread, showPosts, placeholder, isMyPage, match, dispatch} = this.props;
        return (
            <div className='photo-thread'>
                <InfiniteThread {...this.props} />
                {
                    isMyPage && 
                        <center>
                            <Link
                                className='link-no-style new-photo'
                                to={`${match.url}?modalType=new_photo`}
                            >
                                <img src='/svg/photo_color.svg' alt='' />
                                <span>New photo</span>
                            </Link>
                        </center>
                }
                {
                    thread.posts.slice(0, showPosts).map(
                        p => <OfferPost
                                {...p}
                                key={p.post.id}
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


export const PhotoThreadItem = pure(
    ({post, author, dispatch, auth}) => {
        if (!author) return null;
        if (!post.content) return null;

        const classes = classNames(
            'post-item',
            'link-no-style',
            'post-photo-item',
            {'post-item-deleted': post.status === 'deleted'}
        );

        const onSuccess = img => {
            dispatch(updateUser({
                thumbnail: img.preview,
                avatar_post: post.id
            }));
        }

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
                    <ImageUploader
                        ref={e => this.imgUploader = e}
                        cropRatio={1}
                        onSuccess={onSuccess}
                        cropperClassName='avatar-cropper'
                    >
                        <img src='/svg/photo_color.svg' alt='' />
                    </ImageUploader>
                    <PostTime datetime={post.datetime} />
                    <div className='post-option'>
                        <DropdownTools>
                            { auth.user_id === author.id && DeletePostMenuItem(post, dispatch) }
                            { auth.user_id === author.id &&
                                <MenuItem
                                    onClick={() => this.imgUploader.setSrc(`/img/${post.content.full}`)}
                                >
                                    Set as avatar
                                </MenuItem>
                            }
                        </DropdownTools>
                    </div>
                </div>
            </div>
        )        
    }
);

export default connectThread(mapStateToProps)(PhotoThread);