'use strict'

require('es6-promise').polyfill();
require('isomorphic-fetch');

export default class API {
    
    constructor(uri = '') {
        this.uri = uri;
    }
    
    /*
     *  GET crossbrowser XMLHttpRequest
     */
    // XHR(timeout=10000) {
    //     try {
    //         return new XMLHttpRequest();
    //     }catch(e){
    //         throw 'can not create XMLHttpRequest object'
    //     }
    // }
    /*
     *  GET SINGLE POST
     */
    getPost(id) {
        return fetch(`${this.uri}/post/${id}`, {
            credentials: "same-origin",
        });
    }
    
    /*
     *  GET SINGLE THREAD
     */
    getThread(threadId, limit=10, offset=0) {
        const arg = `limit=${limit}&offset=${offset}`;
        return fetch(`${this.uri}/thread/${threadId}?${arg}`, {
            credentials: "same-origin",
        });
    }

    /*
     *  GET CHAT OFFER THREAD
     */
    getChatOffers(filter, limit=20, offset=0) {
        let fd = new FormData();
        fd.append('filter', JSON.stringify(filter));
        fd.append('limit', limit);
        fd.append('offset', offset);
        return fetch(`${this.uri}/thread/chat_offers`, {
            method: 'POST',
            credentials: "same-origin",
            body: fd
        });
    }
    
    /*
     *  GET USERS
     */
    getUsers(userID) {
        let arg_id = Array.isArray(userID) ? userID.join(',') : userID;
        return fetch(`${this.uri}/users?id=${arg_id}`);
    }

    /*
     *  PUT USER
     */ 
    putUser(user) {
        let fd = new FormData();
        fd.append('user', JSON.stringify(user));
        return fetch(`${this.uri}/user/${user.id}`, {
            method: 'PUT',
            credentials: "same-origin",
            body: fd
        })
    }

    /*
     * ADD POST
     */
    addPost(rawPost) {
        let fd = new FormData();
        fd.append('post', JSON.stringify(rawPost));
        return fetch(`${this.uri}/post`, {
            method: 'POST',
            credentials: "same-origin",
            body: fd
        });
    }

    /*
     * DELETE POST
     */
    deletePost(postID) {
        return fetch(`${this.uri}/post/${postID}`, {
            method: 'DELETE',
            credentials: "same-origin",
        });
    }

    /*
     * REVIVE POST
     */
    revivePost(postID) {
        return fetch(`${this.uri}/post/${postID}`, {
            method: 'PUT',
            credentials: "same-origin",
        });
    }

    /*
     * CHAT OFFERS
     */
    answerChatOffer(offerID, post) {
        let fd = new FormData();
        fd.append('post', JSON.stringify(post));
        fd.append('offer_id', offerID);
        return fetch(`${this.uri}/thread`, {
            method: 'POST',
            credentials: "same-origin",
            body: fd
        });
    }

    sendPostToUser(userID, post) {
        let fd = new FormData();
        fd.append('post', JSON.stringify(post));
        fd.append('users_id', JSON.stringify([userID,]));
        return fetch(`${this.uri}/thread`, {
            method: 'POST',
            credentials: "same-origin",
            body: fd
        });
    }

    loadChats(limit=10, offset=0) {
        return fetch(`${this.uri}/chats?limit=${limit}&offset=${0}`, {
            credentials: "same-origin",
        });
    }


    findUsers(limit, offset, filter) {
        let fd = new FormData();
        fd.append('filter', JSON.stringify(filter));
        fd.append('limit', limit);
        fd.append('offset', offset);
        return fetch(`${this.uri}/thread/search_users`, {
            method: 'POST',
            credentials: "same-origin",
            body: fd
        });
    }

    uploadImage(img) {
        let fd = new FormData();
        fd.append('img', JSON.stringify(img));
        return fetch(`${this.uri}/image`, {
            method: 'POST',
            credentials: "same-origin",
            body: fd
        });
    }   

    getUnreaded() {
        return fetch(`${this.uri}/unreaded_posts`, {
            credentials: "same-origin"
        });
    }

    setThreadAsReaded(threadID) {
        return fetch(`${this.uri}/unreaded_posts/${threadID}`, {
            method: 'POST',
            credentials: "same-origin"
        });
    }

    getAuth() {
        return fetch(`${this.uri}/auth`, {
            credentials: "same-origin"
        });
    }

    getLanguages() {
        return fetch(`${this.uri}/language`, {
            credentials: "same-origin"
        });
    }

    getUserFollowers(userID) {
        return fetch(`${this.uri}/user/${userID}/followers`, {
            credentials: "same-origin"
        });
    }

    getUserFollowing(userID) {
        return fetch(`${this.uri}/user/${userID}/following`, {
            credentials: "same-origin"
        });
    }

    followUser(userID) {
        return fetch(`${this.uri}/user/${userID}/follow`, {
            method: 'POST',
            credentials: "same-origin"
        });
    }

    unfollowUser(userID) {
        return fetch(`${this.uri}/user/${userID}/follow`, {
            method: 'DELETE',
            credentials: "same-origin"
        })
    }

}







