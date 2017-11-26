import u from 'updeep';
import { UPDATE_RAW_THREADS, DELETE_RAW_THREAD } from '../constants/ActionTypesConstants';


export default function rawThreads(state={}, action) {
    
    switch(action.type) {

        case UPDATE_RAW_THREADS: {
            return u({
                [action.rawThread.id]: action.rawThread
            }, state);
        }

        case DELETE_RAW_THREAD: {
            return u(u.omit(action.rawThread.id), state);
        }

        default: {
            return state;
        }

    }

}