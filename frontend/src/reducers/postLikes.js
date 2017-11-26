import u from 'updeep';
import { UPDATE_POST_LIKES } from '../constants/ActionTypesConstants';


export default function postLikes(state={}, action) {
    switch (action.type) {

        case UPDATE_POST_LIKES.SUCCESS: {
            return u(
                action.postLikes, state
            )
        }
        default: {
            return state;
        }

    }

}