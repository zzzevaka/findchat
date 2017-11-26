'user strict'

export default class API {
    
    constructor(uri = '') {
        this.uri = uri;
    }
    
    /*
     *  GET crossbrowser XMLHttpRequest
     */
    
    XHR(timeout=10000) {
        try {
            return new XMLHttpRequest();
        // }catch(e){}
        // try {
        //     return new ActiveXObject("Msxml3.XMLHTTP");
        // }catch(e){}
        // try {
        //     return new ActiveXObject("Msxml2.XMLHTTP.6.0");
        // }catch(e){}
        // try {
        //     return new ActiveXObject("Msxml2.XMLHTTP.3.0");
        // }catch(e){}
        // try {
        //     return new ActiveXObject("Msxml2.XMLHTTP");
        // }catch(e){}
        // try {
        //     return new ActiveXObject("Microsoft.XMLHTTP");
        }catch(e){
            throw 'can not create XMLHttpRequest object'
        }
    }
    
    /*  
     *  GET XMLHttpRequest with header X-CSRF-TOKEN
     *  token is taken from the cookies
     */  
    XHR_CSRF() {
        let csrfCookie = document.cookie.match(/CSRF-TOKEN=(\w+)/)
        if (csrfCookie) {
            let xhr = this.XHR();
            xhr.setRequestHeader('X-CSRF-TOKEN', csrfCookie[1])
            return xhr
        }
        else {
            throw('CSRF-TOKEN is not found')
        }
    }
    
    /*
     *  GET SINGLE POST
     */
    getPost(id) {
        let xhr = this.XHR();
        xhr.withCredentials = true;
        xhr.open('GET', `${this.uri}/post/${id}`);
        xhr.send();
        return xhr;  
    }
    
    /*
     *  GET SINGLE THREAD
     */
    getThread(threadId, limit=10, offset=0) {
        let arg = `limit=${limit}&offset=${offset}`;
        let xhr = this.XHR();
        xhr.withCredentials = true;
        xhr.open('GET', `${this.uri}/thread/${threadId}?${arg}`);
        return xhr;
    }

    /*
     *  GET CHAT OFFER THREAD
     */
    getChatOffers(filter, limit=20, offset=0) {
        let fd = new FormData();
        fd.append('filter', JSON.stringify(filter));
        fd.append('limit', limit);
        fd.append('offset', offset);
        let xhr = this.XHR();
        xhr.withCredentials = true;
        xhr.open('POST', `${this.uri}/thread/chat_offers`);
        xhr.send(fd);
        return xhr;
    }
    
    /*
     *  GET USERS
     */
    getUsers(userID) {
        let arg_id = Array.isArray(userID) ? userID.join(',') : userID;
        let xhr = this.XHR();
        xhr.withCredentials = true;
        xhr.open('GET', `${this.uri}/users?id=${arg_id}`);
        return xhr;
    }

    /*
     *  PUT USER
     */ 
    putUser(user) {
        const body = 'user=' + encodeURIComponent(JSON.stringify(user));
        let xhr = this.XHR();
        xhr.withCredentials = true;
        xhr.open('PUT', `${this.uri}/user/${user.id}`)
        xhr.setRequestHeader(
            'Content-Type', 'application/x-www-form-urlencoded'
        )
        xhr.send(body)
        return xhr;
    }

    
    addPost(rawPost) {
        let fd = new FormData();
        fd.append('post', JSON.stringify(rawPost));
        let xhr = this.XHR();
        xhr.withCredentials = true;
        xhr.open('POST', `${this.uri}/post`);
        xhr.send(fd);
        return xhr;
    }

    deletePost(postID) {
        let xhr = this.XHR();
        xhr.withCredentials = true;
        xhr.open('DELETE', `${this.uri}/post/${postID}`);
        xhr.send();
        return xhr;
    }

    revivePost(postID) {
        let xhr = this.XHR();
        xhr.withCredentials = true;
        xhr.open('PUT', `${this.uri}/post/${postID}`);
        xhr.send();
        return xhr;
    }

    /*
     * GET POSTS LIKES BRIEF
     */
    getPostLikesBrief(postsID) {
        let argID = Array.isArray(postsID) ? postsID.join(',') : postsID;
        let xhr = this.XHR();
        xhr.withCredentials = true;
        xhr.open('GET', `${this.uri}/post_likes_brief?posts_id=${argID}`);
        xhr.send();
        return xhr;
    }

    /*
     * GET ONE POST LIKES FULL
     */
    getPostLikeFull(postID) {
        let xhr = this.XHR();
        xhr.withCredentials = true;
        xhr.open('GET', `${this.uri}/post_likes/${postID}`);
        xhr.send();
        return xhr;
    }
    
    /*
     * ADD POST LIKE
     */
    addPostLike(postID) {
        let xhr = this.XHR();
        xhr.withCredentials = true;
        xhr.open('POST', `${this.uri}/post_likes/${postID}`);
        console.log(xhr)
        xhr.send();
        return xhr;
    }

    /*
     * DELETE POST LIKE
     */
    deletePostLike(postID) {
        let xhr = this.XHR();
        xhr.withCredentials = true;
        xhr.open('DELETE', `${this.uri}/post_likes/${postID}`);
        xhr.send();
        return xhr;
    }


    /*
     * CHAT OFFERS
     */
    
    // loadChatOffers(filter) {
    //     let fd = new FormData();
    //     fd.append('filter', JSON.stringify(filter));
    //     let xhr = this.XHR();
    //     xhr.withCredentials = true;
    //     // xhr.open('GET', `${this.uri}/chat_offers`);
    //     xhr.open('POST', `${this.uri}/thread/chat_offers`);
    //     xhr.send(fd);
    //     return xhr;
    // }

    answerChatOffer(offerID, post) {
        let fd = new FormData();
        fd.append('post', JSON.stringify(post));
        fd.append('offer_id', offerID);
        let xhr = this.XHR();
        xhr.withCredentials = true;
        // xhr.open('POST', `${this.uri}/chat_offer_join/${offerID}`);
        xhr.open('POST', `${this.uri}/thread`);
        xhr.send(fd);
        return xhr;
    }

    sendPostToUser(userID, post) {
        let fd = new FormData();
        fd.append('post', JSON.stringify(post));
        fd.append('users_id', JSON.stringify([userID,]));
        let xhr = this.XHR();
        xhr.withCredentials = true;
        xhr.open('POST', `${this.uri}/thread`);
        xhr.send(fd);
        return xhr;
    }

    loadChats(limit=10, offset=0) {
        let xhr = this.XHR();
        xhr.withCredentials = true;
        xhr.open('GET', `${this.uri}/chats?limit=${limit}&offset=${0}`);
        xhr.send();
        return xhr;
    }


    findUsers(limit, offset, filter) {
        let fd = new FormData();
        fd.append('filter', JSON.stringify(filter));
        fd.append('limit', limit);
        fd.append('offset', offset);
        let xhr = this.XHR();
        xhr.withCredentials = true;
        // xhr.open('POST', `${this.uri}/search/users`);
        xhr.open('POST', `${this.uri}/thread/search_users`);
        xhr.send(fd);
        return xhr;
    }

    uploadImage(img) {
        let fd = new FormData();
        fd.append('img', JSON.stringify(img));
        let xhr = this.XHR();
        xhr.withCredentials = true;
        xhr.open('POST', `${this.uri}/image`);
        xhr.send(fd);
        return xhr;
    }   

    getUnreaded() {
        let xhr = this.XHR();
        xhr.withCredentials = true;
        xhr.open('GET', `${this.uri}/unreaded_posts`);
        xhr.send();
        return xhr;
    }

    setThreadAsReaded(threadID) {
        let xhr = this.XHR();
        xhr.withCredentials = true;
        xhr.open('POST', `${this.uri}/unreaded_posts/${threadID}`);
        xhr.send();
        return xhr;
    }

    registration(login, password) {
        let fd = new FormData();
        fd.append('login', login);
        fd.append('password', password);
        let xhr = this.XHR();
        xhr.withCredentials = true;
        xhr.open('POST', `${this.uri}/registration`);
        xhr.send(fd);
        return xhr;
    }

    login(login, password) {
        let xhr = this.XHR();
        let fd = new FormData();
        fd.append('login', login);
        fd.append('password', password);
        xhr.withCredentials = true;
        xhr.open('POST', `${this.uri}/login`);
        xhr.send(fd);
        return xhr;
    }

    logout() {
        let xhr = this.XHR();
        xhr.withCredentials = true;
        xhr.open('GET', `${this.uri}/logout`);
        xhr.send();
        return xhr;
    }

    check_email(email) {
        let xhr = this.XHR();
        xhr.withCredentials = true;
        xhr.open('GET', `${this.uri}/check_email?email=${email}`);
        xhr.send();
        return xhr;
    }

    getAuth(password) {
        let xhr = this.XHR();
        xhr.withCredentials = true;
        xhr.open('GET', `${this.uri}/auth?password=${password}`);
        xhr.send();
        return xhr;
    }

    putAuth(newAuth) {
        let xhr = this.XHR();
        xhr.withCredentials = true;
        xhr.open('PUT', `${this.uri}/auth`);
        xhr.setRequestHeader(
            // 'Content-Type', 'application/json'
            'Content-Type', 'application/x-www-form-urlencoded'
        );
        xhr.send(JSON.stringify({
            auth: newAuth
        }));
        return xhr;
    }

    getLanguages() {
        let xhr = this.XHR();
        xhr.withCredentials = true;
        xhr.open('GET', `${this.uri}/language`);
        xhr.send();
        return xhr;
    }

}







