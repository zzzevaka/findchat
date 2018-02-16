import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {MenuItem} from 'react-bootstrap';
import classNames from 'classnames';
import {translate} from 'react-i18next';
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
        const {thread, showPosts, placeholder, isMyPage, match, dispatch, t} = this.props;
        return (
            <div className='photo-thread'>
                <InfiniteThread {...this.props} />
                {
                    isMyPage && 
                        <center>
                            <Link
                                className='link-no-style button-new-post'
                                to={`${match.url}?modalType=new_photo`}
                            >
                                <span>{t("New photo")}</span>
                            </Link>
                        </center>
                }
                {
                    thread.posts.slice(0, showPosts).map(
                        p => <PhotoPost
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

PhotoThread = translate('translations')(PhotoThread);


export const PhotoPost = pure(
    (props) => <OfferPost {...props} className='post-photo-item' />
);

export default connectThread(mapStateToProps)(PhotoThread);