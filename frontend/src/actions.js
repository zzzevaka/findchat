import API from './api';
import 'nprogress/nprogress.css';
import {
    UPDATE_THREADS_POSTS,
    UPDATE_USERS,
    UPDATE_POST_LIKES,
    UPDATE_SEARCH_FILTER,
    SEARCH_USERS_UPDATE,
    UPDATE_POST_COMPOSERS,
    UPDATE_UPLOAD_IMAGES,
    UPDATE_UNREADED_POSTS,
    UPDATE_AUTH
} from './constants/ActionTypesConstants';
import Notifications from 'react-notification-system-redux';
import React from 'react';
import NProgress from 'nprogress';

import {
    ChatOfferAnswerSuccess,
    ChatOfferAnswerDoubleAnswer,
    UnknownError,
    EditingSuccess
} from './components/Notifies';

const api = new API('/api_v1');
NProgress.configure({
    easing: 'ease-out',
    speed: 600,
    showSpinner: false
});


export function loadThreadRequest(threads) {
    return {
        type: UPDATE_THREADS_POSTS.REQUEST,
        threads: threads
    }
}

export function loadThreadSuccess(threads, posts, users, sortPosts) {
    return {
        type: UPDATE_THREADS_POSTS.SUCCESS,
        threads: threads,
        posts: posts,
        users: users,
        sortPosts: sortPosts,
    }
}

export function loadThreadError(threads, errorCode) {
    return {
        type: UPDATE_THREADS_POSTS.ERROR,
        threads: threads,
        errorCode: errorCode
    }
}

export function appendPost(threads, posts) {
    return {
        type: UPDATE_THREADS_POSTS.APPEND_POST,
        threads: threads,
        posts: posts
    }
}


export function flushThread(threads) {
    return {
        type: UPDATE_THREADS_POSTS.FLUSH,
        threads: threads
    }
}


export function loadThread(
    threadID,
    limit=30,
    offset=0,
    flush=false,
) {
    return dispatch => {
        NProgress.start();
        dispatch(loadThreadRequest([threadID,]));
        api.getThread(threadID, limit, offset).then(
            r => r.json()
        ).then(
            r => dispatch(loadThreadSuccess(r.threads, r.posts, r.users))
        ).catch(
            e => dispatch(loadThreadError([threadID,], e))
        ).then(
            () => NProgress.done()
        )
    }
}

export function loadChatOffers(limit=20, offset=0, filter) {
    NProgress.start();
    return (dispatch) => {
        dispatch(loadThreadRequest(['chat_offers',]));
        api.getChatOffers(filter, limit, offset).then(
            r => r.json()
        ).then(
            ({threads, posts, users}) => dispatch(loadThreadSuccess(threads, posts, users, () => {}))
        ).then(
            () => NProgress.done()
        );
    }
}

export function loadUsersSuccess(users) {
    return {
        type: UPDATE_USERS.SUCCESS,
        users: users
    };
}

export function loadUsersRequest(users) {
    return {
        type: UPDATE_USERS.REQUEST,
        users: users
    };
}

export function loadUsers(userID) {
    return dispatch => {
        const ids = Array.isArray(userID) ? userID : [userID,];
        dispatch(loadUsersRequest(ids))
        return api.getUsers(ids).then(
            response => response.json()
        ).then(json => {
            dispatch(loadUsersSuccess(json.users));
        })
    }
}

export function getUserFollowing(userID, limit, offset) {
    NProgress.start();
    return dispatch => {
        dispatch(loadThreadRequest([`user_following_${userID}`,]));
        api.getUserFollowing(userID, limit, offset).then(
            r => {
                if (r.status !== 200) throw new Error('err');
                return r.json();
            }
        ).then(
            ({threads, posts, users}) => dispatch(loadThreadSuccess(threads, posts, users))
        ).catch(
            e => alert(e)
        ).then(
            () => NProgress.done()
        );
    }
}

export function getUserFollowers(userID, limit, offset) {
    NProgress.start();
    return dispatch => {
        dispatch(loadThreadRequest([`user_followers_${userID}`,]));
        api.getUserFollowers(userID, limit, offset).then(
            r => {
                if (r.status !== 200) throw new Error('err');
                return r.json();
            }
        ).then(
            ({threads, posts, users}) => dispatch(loadThreadSuccess(threads, posts, users))
        ).catch(
            e => alert(e)
        ).then(
            () => NProgress.done()
        );

    }
}

export function updateUser(user) {
    return (dispatch, getState) => {
        const user_id = getState().auth.user_id;
        if (!user_id) return;
        return api.putUser({...user, id: user_id}).then(
            r => r.json()
        ).then(
            ({users}) => {
                dispatch(Notifications.success({
                    position: 'tr',
                    children: <EditingSuccess />
                }));
                dispatch(loadUsersSuccess(users));
                return Promise.resolve(users[user_id])
            }
        ).catch(
            e => dispatch(Notifications.error({
                position: 'tr',
                children: <UnknownError />
            }))
        )
    }
}

export function getPost(postID) {
    return dispatch => {
        api.getPost(postID).then(
            r => r.json()
        ).then(
            ({posts, users}) => dispatch(loadThreadSuccess({}, posts, users))
        )
    }
}

export function addPost(post, composerKey) {
    return dispatch => {
        if (composerKey) {
            dispatch(updatePostComposers(
                {[composerKey]: { status: 'uploading' }}
            ))
        }
        return api.addPost(post).then(
            r => r.json()
        ).then(
            j => {
                dispatch(loadThreadSuccess(j.threads, j.posts, {}));
                return Promise.resolve(j.posts[j.new_post_id]);
            }
        );
    }
}

export function addAvatarPost(post) {
    return dispatch => {
        dispatch(addPost(post)).then(post => {
            dispatch(updateUser({
                avata_post: post.id,
                thumbnail: post.content.preview
            }));
        });
    }
}


export function deletePost(postID) {
    return dispatch => {
        dispatch(loadThreadSuccess(
            {},
            { [postID]: {status: 'deleted'} },
            {}
        ));
        api.deletePost(postID).then(
            r => {
                if (r.status !== 200) {
                    dispatch(Notifications.error({
                        position: 'tr',
                        children: <UnknownError />
                    }));
                    dispatch(loadThreadSuccess(
                        {},
                        { [postID]: {status: 'revived'} },
                        {}
                    ));
                }
            }
        )
    }
}

export function revivePost(postID) {
    return dispatch => {
        api.revivePost(postID).then(
            r => {
                if (r.status === 200) {
                    dispatch(loadThreadSuccess(
                        {},
                        { [postID]: {status: 'revived'} },
                        {}
                    ));
                }
                else {
                    dispatch(Notifications.error({
                        position: 'tr',
                        children: <UnknownError />
                    }));
                }
            }
        )
    }
}

export function updatePostLikesSuccess(likes) {
    return {
        type: UPDATE_POST_LIKES.SUCCESS,
        postLikes: likes
    }
}

export function answerChatOffer(offerID, post) {
    return (dispatch, getState) => {
        const state = getState();
        const offer = state.posts[offerID];
        const user = state.users[offer.author_id];
        api.answerChatOffer(offerID, post).then(
            r => ({status: r.status, json: r.json()})
        ).then(
            ({status, json}) => {
                switch(status) {

                    case 200:
                        json.then(body => {
                            dispatch(
                                Notifications.success({
                                    position: 'tr',
                                    children: (
                                        <ChatOfferAnswerSuccess
                                            chatID={body.thread_id}
                                            thumbnail={body.thumbnail}
                                        />
                                    ),
                                })
                            );
                        });

                        break;

                    case 409:
                        dispatch(
                            Notifications.error({
                                position: 'tr',
                                children: <ChatOfferAnswerDoubleAnswer />,
                            })
                        );
                        break;

                    default:
                        dispatch(
                            Notifications.error({
                                position: 'tr',
                                children: <UnknownError />,
                            })
                        );
                }
            }
        )
    }

}

export function sendPostToUser(userID, post) {
    return dispatch => {
        return api.sendPostToUser(userID, post).then(
            r => r.json()
        ).then(
            j => Promise.resolve(j.thread_id)
        );
    }
}

export function loadChats(limit, offset) {
    NProgress.start();
    return dispatch => {
        dispatch(loadThreadRequest(['chat_list',]));
        api.loadChats(limit, offset).then(
            r => r.json()
        ).then(
            ({threads, posts, users}) => {
                const chatListThread = {
                    id: 'chat_list',
                    posts: Object.keys(threads).map(id => id),
                    no_more_posts: Object.keys(threads).length < limit
                };
                dispatch(loadThreadSuccess(
                    {chat_list: chatListThread, ...threads},
                    posts,
                    users
                ))
            }
        ).then(
            () => NProgress.done()
        );
    }
}

export function updateSearchFilter(filter) {
    return {
        type: UPDATE_SEARCH_FILTER,
        filter: filter
    }
}

export function updateSearchUsersID(usersID) {
    return {
        type: SEARCH_USERS_UPDATE,
        usersID: usersID
    }
}

export function findUsers(limit=20, offset=0, filter) {
    NProgress.start();
    return dispatch => {
        dispatch(loadThreadRequest(['search_users']));
        api.findUsers(limit, offset, filter).then(
            r => r.json()
        ).then(
            ({threads, posts, users}) => dispatch(loadThreadSuccess(threads, posts, users, () => {}))
        ).then(
            () => NProgress.done()
        );
    }
}


export function updatePostComposers(postComposers) {
    return {
        type: UPDATE_POST_COMPOSERS,
        postComposers: postComposers
    };
}

export function updateUploadImages(uploadImages) {
    return {
        type: UPDATE_UPLOAD_IMAGES,
        uploadImages: uploadImages
    }
}


export function uploadImgSource(storeKey, file) {
    return dispatch => {
        dispatch(updateUploadImages({[storeKey]: {src: 'l'}}));
        let fr = new FileReader();
        fr.onloadend = () => {
            dispatch(updateUploadImages({[storeKey]: {src: fr.result}}));
        }
        fr.readAsDataURL(file);
    }
} 

export function updateUnreadedPostsFull(unreadedPosts) {
    return {
        type: UPDATE_UNREADED_POSTS.FULL,
        unreadedPosts: unreadedPosts
    }
}

export function updateUnreadedPostsAddToThread(threadID, count) {
    return {
        type: UPDATE_UNREADED_POSTS.ADD_TO_THREAD,
        threadID: threadID,
        count: count
    }
}

export function updateUnreadedPostsDelFromThread(threadID) {
    return {
        type: UPDATE_UNREADED_POSTS.DEL_FROM_THREAD,
        threadID: threadID
    }
}

export function loadUnreaded() {
    return dispatch => {
        api.getUnreaded().then(
            r => r.json()
        ).then(
            j => dispatch(updateUnreadedPostsFull(j.unreaded_posts))
        );
    }
}

export function setThreadAsReaded(threadID) {
    return dispatch => {
        dispatch(updateUnreadedPostsDelFromThread(threadID));
        api.setThreadAsReaded(threadID).then(
            r => {if(r.status !== 200) throw new Error('unknown error')}
        ).catch(
            e => dispatch(Notifications.error({
                    position: 'tr',
                    children: <UnknownError />,
                }))
        );
    }
}


export function followUser(userID) {
    return dispatch => {
        api.followUser(userID).then(
            r => {
                if (r.status !== 200) throw new Error('err');
                dispatch(loadUsersSuccess({
                    [userID]: {
                        current_user_follows: true
                    }
                }));
            }
        ).catch(
            e => alert(e)
        )
    }
}

export function unfollowUser(userID) {
    return dispatch => {
        api.unfollowUser(userID).then(
            r => {
                if (r.status !== 200) throw new Error('err');
                dispatch(loadUsersSuccess({
                    [userID]: {
                        current_user_follows: false
                    }
                }));
            }
        ).catch(
            e => alert(e)
        )
    }
}

export function updateAuth(auth) {
    return {
        type: UPDATE_AUTH,
        auth: auth
    };
}

export function getAuth() {
    return dispatch => {
        api.getAuth().then(
            r => {
                if (r.status !== 200) throw new Error({show_user: true});
                return r.json()
            }
        ).then(
            j => dispatch(updateAuth(j))
        ).catch(
            e => alert(e)
        );
    }
}
