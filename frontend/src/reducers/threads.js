import u from 'updeep';
import { UPDATE_THREADS_POSTS } from '../constants/ActionTypesConstants';
import { uniqueArray } from '../utils';
import { THREAD_TYPE } from '../constants/threadType';

const init_state = {
    chatsID: [],
    // unreadedSum: 0
}

export default function threads(state = init_state, action) {
    
    switch(action.type) {
        
        case UPDATE_THREADS_POSTS.REQUEST: {
            return action.threads.reduce((state, id) => {
                return u({
                    [id]: {
                        id: id,
                        status: 'loading',
                        posts: o => {return o || []}
                    },
                }, state)
            }, state)
        }
        
        case UPDATE_THREADS_POSTS.SUCCESS: {
            let new_state =  u(
                u.map(thread => {
                    return u({
                        status: 'loaded',
                        posts: n => u.withDefault(
                            [],
                            // o => uniqueArray([...n, ...o]).sort((a,b) => {
                            //     return b-a
                            // })
                            o => uniqueArray([ ...o, ...n]).sort(
                                action.sortPosts || ((a,b) => b-a)
                            )
                        )
                    }, thread) // u
                }, action.threads), // u.map
                state
            ); // u
            // if (action.postsMiddleware) {
            //     console.log(new_state);
            //     new_state.posts = action.postsMiddleware(new_state.posts);
            // }
            let chatsID = [].concat(state.chatsID);
            for (const t in action.threads) {
                if (action.threads[t].type == THREAD_TYPE['CHAT']) {
                    chatsID.push(t);
                }
            }
            return u({
                chatsID: uniqueArray(chatsID).sort((a,b) => {return b-a}),
            }, new_state);
        }

        case UPDATE_THREADS_POSTS.APPEND_POST: {
            return u(
                u.map(thread => {
                    return u({
                        posts: n => u.withDefault(
                            [],
                            // o => uniqueArray([...n, ...o]).sort((a,b) => {
                            //     return b-a
                            // })
                            o => uniqueArray([ ...n, ...o])
                        )
                    }, thread) // u
                }, action.threads), // u.map
                state
            ); // u
        }

        case UPDATE_THREADS_POSTS.FLUSH: {
            return action.threads.reduce((state, id) => {
                return u({
                    [id]: {
                        id: id,
                        status: 'flushed', 
                        no_more_posts: false,
                        posts: []
                    },
                }, state)
            }, state);
        }
        
        default: {
            return state
        }
    } // switch
} // threads
