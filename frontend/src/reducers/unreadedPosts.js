import u from 'updeep';
import { UPDATE_UNREADED_POSTS } from '../constants/ActionTypesConstants';

const init_state = {
    sum: 0,
    threads: []
}


export default function unreadedPosts(state=init_state, action) {

    switch(action.type) {

        case UPDATE_UNREADED_POSTS.FULL: {
            return action.unreadedPosts;
        }

        case UPDATE_UNREADED_POSTS.ADD_TO_THREAD: {

            const {threadID, count} = action;
            return u({
                threads: {
                    [threadID]: state.threads[threadID] + count || count
                },
                sum: state.sum + count
            }, state);
        }

        case UPDATE_UNREADED_POSTS.DEL_FROM_THREAD: {
            const {threadID} = action;
            return u({
                threads: {
                    [threadID]: 0
                },
                // sum: state.sum - state.threads[threadID] || state.sum
                sum: s => {return s - (state.threads[threadID] || s)}
            }, state);
        }

        default: {
            return state;
        }



    }

}