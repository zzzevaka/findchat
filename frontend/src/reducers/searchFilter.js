import { UPDATE_SEARCH_FILTER } from '../constants/ActionTypesConstants';
import u from 'updeep';

const initialState = {
    tags: [],
    lang: [],
};

export default function searchFilter(state=initialState, action) {

    switch (action.type) {

        case UPDATE_SEARCH_FILTER: {
            return u(action.filter, state);
        }

        default: {
            return state;
        }
    }


}