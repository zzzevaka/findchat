import API from './api';
import {getCookie, closeModal} from './utils';
import shortid from 'shortid';
import {THREAD_TYPE} from './constants/threadType';
import arrayFrom from 'array-from';
import u from 'updeep';
import {
    UPDATE_THREADS_POSTS,
    UPDATE_USERS,
    UPDATE_POST_LIKES,
    UPDATE_CHAT_OFFERS,
    UPDATE_RAW_THREADS,
    DELETE_RAW_THREAD,
    UPDATE_SEARCH_FILTER,
    SEARCH_USERS_UPDATE,
    UPDATE_POST_COMPOSERS,
    UPDATE_UPLOAD_IMAGES,
    TOGGLE_SIDEBAR,
    UPDATE_UNREADED_POSTS,
    UPDATE_AUTH
} from './constants/ActionTypesConstants';
import { browserHistory } from 'react-router';

import Notifications from 'react-notification-system-redux';
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import {
    ChatOfferAnswerSuccess,
    ChatOfferAnswerDoubleAnswer,
    UnknownError,
    EditingSuccess
} from './components/Notifies';

import Set from 'es6-set';


const api = new API('/api_v1');

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
        dispatch(loadThreadRequest([threadID,]));            
        let xhr = api.getThread(threadID, limit, offset);
        xhr.send();
        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) return;
            if (xhr.status === 200) {
                const body = JSON.parse(xhr.responseText);
                if (body.threads && body.posts) {
                    dispatch(loadThreadSuccess(body.threads, body.posts, body.users));
                }
                // if (body.users) {
                //     dispatch(loadUsersSuccess(body.users));
                // }
            } else {
                dispatch(loadThreadError([threadID,], xhr.status));
            }
        }
    }
    
}

export function loadChatOffers(limit=20, offset=0, filter) {
    return (dispatch) => {
        dispatch(loadThreadRequest(['chat_offers',]));
        let xhr = api.getChatOffers(
            filter,
            limit,
            offset
        );
        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) return;
            if (xhr.status === 200) {
                const body = JSON.parse(xhr.responseText);
                dispatch(loadThreadSuccess(body.threads, body.posts, body.users));
                // dispatch(loadUsersSuccess(body.users));
            } else {
                dispatch(loadThreadError(['chat_offers',], xhr.status));
            }
        }
    };
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
        let xhr = api.getUsers(ids);
        xhr.onreadystatechange = function() {
            if (xhr.readyState !== 4) return;
            
            if (xhr.status === 200) {
                const body = JSON.parse(xhr.responseText)
                dispatch(loadUsersSuccess(body.users))
            } else {
                // dispatch(loadUsersError(ids))
            }
        };
        xhr.send();
        
    }
}

export function updateUser(user, callback) {
    return dispatch => {
        let xhr = api.putUser({
            ...user,
            id: getCookie('current_user_id')
        });
        xhr.onreadystatechange = function() {
            if (xhr.readyState !== 4) return;
            if (xhr.status === 200) {
                dispatch(
                    Notifications.info({
                        position: 'tr',
                        children: <EditingSuccess />,
                    })
                )
                if (callback) callback();
            }
            else {
                dispatch(
                    Notifications.error({
                        position: 'tr',
                        children: <UnknownError />,
                    })
                )
            }
        };
    }
}

export function getPost(postID) {
    return dispatch => {
        let xhr = api.getPost(postID);
        xhr.onreadystatechange = () => {
            if (xhr.readyState != 4) return;
            if (xhr. status === 200) {
                const {posts, users} = JSON.parse(xhr.responseText);
                dispatch(loadThreadSuccess({}, posts));
            }    
        }
    }
}

export function addPost(post, composerKey) {
    return dispatch => {
        if (composerKey) {
            dispatch(updatePostComposers(
                {[composerKey]: { status: 'uploading' }}
            ))
        }
        let xhr = api.addPost(post);
        xhr.onreadystatechange = () => {
            if (xhr.readyState != 4) return;
            if (xhr.status === 200) {
                const {posts, threads, unreaded_posts} = JSON.parse(xhr.responseText);
                dispatch(loadThreadSuccess(
                    threads,
                    posts,
                    {},
                ));
                if (composerKey) {
                    dispatch(updatePostComposers(
                        {[composerKey]: { status: 'success' }}
                    ))
                }
            }
        }
    }
}


export function deletePost(postID) {
    return dispatch => {
        dispatch(loadThreadSuccess(
            {},
            { [postID]: {status: 'deleted'} },
            {}
        ));
        let xhr = api.deletePost(postID);
        xhr.onreadystatechange = () => {
            if (xhr.readyState != 4) return;
            if (xhr.status === 200) {
            }
        }
    }
}

export function revivePost(postID) {
    return dispatch => {
        let xhr = api.revivePost(postID);
        xhr.onreadystatechange = () => {
            if (xhr.readyState != 4) return;
            if (xhr.status === 200) {
                dispatch(loadThreadSuccess(
                    {},
                    { [postID]: {status: 'revived'} },
                    {}
                ))
            }
        }
    }
}


export function addAvatarPost(post) {
    return (dispatch, getState) => {
        const user_id = getCookie('current_user_id');
        const user = getState().users[user_id];
        if (!user || !post.content_id) return;
        let xhr = api.addPost({thread_id: user.photo_thread_id, ...post});
        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) return;
            if (xhr.status === 200) {
                const {new_post_id} = JSON.parse(xhr.responseText);
                dispatch(updateUser({id: user.id, avatar_id: new_post_id}));
            }
        }
    }
}


export function updatePostLikesSuccess(likes) {
    return {
        type: UPDATE_POST_LIKES.SUCCESS,
        postLikes: likes
    }
}


function _updatePostLikes(xhr) {
    return (dispatch, getState) => {
        xhr.onreadystatechange = () => {
            if (xhr.readyState != 4) return;
            if (xhr.status === 200) {
                const {post_likes} = JSON.parse(xhr.responseText);
                dispatch(
                    updatePostLikesSuccess(post_likes)
                );
                // load users if it's needed
                const loaded = arrayFrom(
                    Object.keys(getState().users), i => Number(i)
                );
                let needToLoad = [];
                for (let postID in post_likes) {
                    post_likes[postID].users_id.forEach(userID => {
                        if (loaded.indexOf(userID) === -1) needToLoad.push(userID)
                    })
                }
                if (needToLoad.length) dispatch(loadUsers(needToLoad))
            }
        }
    }
}


export function updatePostLikesBrief(postsID) {
    return dispatch => {
        if(!postsID.length) return;
        let xhr = api.getPostLikesBrief(postsID);
        dispatch(_updatePostLikes(xhr));
    }
}

export function updatePostLikeFull(postID) {
    return dispatch => {
        let xhr = api.getPostLikeFull(postID);
        dispatch(_updatePostLikes(xhr));
    }
}


export function addPostLike(postID) {
    return dispatch => {
        let xhr = api.addPostLike(postID);
        dispatch(_updatePostLikes(xhr));
    }
}


export function deletePostLike(postID) {
    return dispatch => {
        let xhr = api.deletePostLike(postID);
        dispatch(_updatePostLikes(xhr));
    }
}

export function answerChatOffer(offerID, post) {
    return (dispatch, getState) => {
        const state = getState();
        const offer = state.posts[offerID];
        const user = state.users[offer.author_id];
        let xhr = api.answerChatOffer(offerID, post);
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== 4) return;
            closeModal();
            if (xhr.status == 200) {
                dispatch(
                    Notifications.info({
                        position: 'tr',
                        children: (
                            <ChatOfferAnswerSuccess
                                chatID={JSON.parse(xhr.responseText).thread_id}
                                thumbnail={user.thumbnail}
                            />
                        ),
                    })
                )
            }
            else if (xhr.status == 409) {
                dispatch(
                    Notifications.error({
                        position: 'tr',
                        children: <ChatOfferAnswerDoubleAnswer />,
                    })
                )
            }
            else {
                dispatch(
                    Notifications.error({
                        position: 'tr',
                        children: <UnknownError />,
                    })
                )
            }
        }
    }

}

export function sendPostToUser(userID, post) {
    return dispatch => {
        let xhr = api.sendPostToUser(userID, post);
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== 4) return;
            if (xhr.status == 200) {
                browserHistory.push(`/chats/${JSON.parse(xhr.responseText).thread_id}`);
            }
        }
    }
}

export function addThreadFromOffer(offerID) {
    return dispatch => {
        let xhr = api.joinChatOffer(offerID);
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== 4) return;
            if (xhr.status == 200) {
                browserHistory.push(`/chats/${JSON.parse(xhr.responseText).thread_id}`);
                // const body = JSON.parse(xhr.responseText);
                // dispatch(
                //     loadThreadSuccess(body.threads, body.posts)
                // )
            }
        }
    }
}

export function loadChats(limit, offset) {
    return dispatch => {
        dispatch(loadThreadRequest(['chat_list',]));
        let xhr = api.loadChats(limit, offset);
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== 4) return;
            if (xhr.status == 200) {
                const body = JSON.parse(xhr.responseText);
                let chatListThread = {
                    id: 'chat_list',
                    posts: Object.keys(body.threads).map(id => id),
                    no_more_posts: Object.keys(body.threads).length < limit
                };
                // chatListThread.posts = chatListThread.posts.sort((a,b) => {
                //     return body.threads[a].posts[0].id < body.threads[b].posts[0].id ? 1 :-1;
                // })
                dispatch(loadThreadSuccess(
                    {chat_list: chatListThread, ...body.threads},
                    body.posts,
                    body.users,
                    () => {},
                ));
                // dispatch(loadUsersSuccess(body.users));
            }
        }
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
    return dispatch => {
        dispatch(loadThreadRequest(['search_users']));
        let xhr = api.findUsers(
            limit,
            offset,
            filter
        );
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== 4) return;
            if (xhr.status == 200) {
                const body = JSON.parse(xhr.responseText);
                dispatch(loadThreadSuccess(body.threads, body.posts, body.users, () => {}));
                // dispatch(loadUsersSuccess(body.users));
            }
            else {
                dispatch(loadThreadError(['search_users',], xhr.status));
            }
        }
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
    return dispatch => 
    {
        dispatch(updateUploadImages({[storeKey]: {src: 'l'}}));
        let fr = new FileReader();
        fr.onloadend = () => {
            dispatch(updateUploadImages({[storeKey]: {src: fr.result}}));
        }
        fr.readAsDataURL(file);
    }
} 

export function uploadImage(storeKey, img) {
    return dispatch => {
        dispatch(updateUploadImages({
            [storeKey]: {result: 'l'}
        }));
        let xhr = api.uploadImage(img);
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== 4) return;
            if (xhr.status == 200) {
                dispatch(updateUploadImages({
                    [storeKey]: {
                        src: img.src,
                        result: JSON.parse(xhr.responseText).img
                    }
                }));
            }
        }
    }
}

// export function toggleSideBar() {
//     return {
//         type: TOGGLE_SIDEBAR
//     };
// }


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
        let xhr = api.getUnreaded();
        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) return;
            if (xhr.status === 200) {
                console.log(xhr.responseText);
                const body = JSON.parse(xhr.responseText);
                console.log(body);
                dispatch(updateUnreadedPostsFull(body.unreaded_posts));
            }
        }
    }
}

export function setThreadAsReaded(threadID) {
    return dispatch => {
        dispatch(updateUnreadedPostsDelFromThread(threadID));
        let xhr = api.setThreadAsReaded(threadID);
        xhr.onreadystatechange = () => {
            if (xhr.readyState != 4) return;
            if (xhr.status !== 200) {
                console.warn('error at setThreadAsReaded ' + threadID);
            }
        }
    }
}

export function updateAuth(auth) {
    return {
        type: UPDATE_AUTH,
        auth: auth
    };
}

export function getAuth(password) {
    return dispatch => {
        let xhr = api.getAuth(password);
        xhr.onreadystatechange = () => {
            if (xhr.readyState != 4) return;
            if (xhr.status === 200) {
                dispatch(
                    updateAuth({
                        ...JSON.parse(xhr.responseText),
                        password: password
                    })
                );
            }
            else if (xhr.status === 403) {
                dispatch(
                    Notifications.error({
                        position: 'tr',
                        message: 'Incorrect password',
                    })
                );
            }
        }
    }
}

export function putAuth(newAuth, password) {
    return dispatch => {
        let xhr = api.putAuth(newAuth);
        xhr.onreadystatechange = () => {
            try {
                if (xhr.readyState != 4) return;
                if (xhr.status === 200) {
                    dispatch(
                        updateAuth({
                            ...JSON.parse(xhr.responseText),
                            password: password
                        })
                    );
                    dispatch(
                        Notifications.info({
                            position: 'tr',
                            children: <EditingSuccess />,
                        })
                    );
                }
                else {
                    const errMsg = JSON.parse(xhr.responseText).error || 'unknown error';
                    dispatch(
                        Notifications.error({
                            position: 'tr',
                            message: errMsg
                        })
                    );
                }
            } catch(e) {
                console.warn(e);
                dispatch(
                        Notifications.error({
                            position: 'tr',
                            children: <UnknownError />
                        })
                    );
            }

        }
    }
}