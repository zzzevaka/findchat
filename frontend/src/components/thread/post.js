import React from 'react';
import classNames from 'classnames';
import {DropdownTools} from 'react-bootstrap';
import {translate} from 'react-i18next';
import {withAuth} from '../../auth';

let Post = function({post, author, className, dispatch, auth}) {
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