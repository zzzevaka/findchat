import u from 'updeep';
import { UPDATE_THREADS_POSTS } from '../constants/ActionTypesConstants';

export default function posts(state = {}, action) {
    
    switch(action.type) {
    
        case UPDATE_THREADS_POSTS.SUCCESS:
        case UPDATE_THREADS_POSTS.APPEND_POST:

            return u(
                u.map(post => {
                    return post
                }, action.posts)
            , state);
        
        default:
            return state
    
    } // switch
    
}
