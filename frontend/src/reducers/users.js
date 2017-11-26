import u from 'updeep';
import {
    UPDATE_USERS,
    UPDATE_THREADS_POSTS
} from '../constants/ActionTypesConstants';


export default function users(state = {}, action) {

    switch(action.type) {
    
        case UPDATE_USERS.REQUEST: {
            return action.users.reduce((state, id) => {
                return u({[id]: {status: 'loading'}}, state)
            }, state);
        }

        case UPDATE_THREADS_POSTS.SUCCESS:
        case UPDATE_USERS.SUCCESS: {
            return u(
                u.map(user => {
                    return u({
                        status: 'loaded'
                    }, user);
                }, action.users)
                , state)
        }
        
        case UPDATE_USERS.ERROR: {
            return state
        }
    
        default: {
            return state
        }
    
    } // switch

}
