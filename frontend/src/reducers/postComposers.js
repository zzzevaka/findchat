import { UPDATE_POST_COMPOSERS } from '../constants/ActionTypesConstants';
import u from 'updeep';


export default function postComposers(state={}, action) {

    switch (action.type) {

        case UPDATE_POST_COMPOSERS: {
            return u(action.postComposers, state);
        }

        default: {
            return state;
        }
    }


}