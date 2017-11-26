import u from 'updeep';
import { UPDATE_CHAT_OFFER_FILTER } from '../constants/ActionTypesConstants';

const initialState = {
    lang: {},
    tags: {}
}

export default function chatOffersFilter(state=initialState, action) {

    switch (action.type) {
        
        case UPDATE_CHAT_OFFER_FILTER.LANG: {
            return u({
                lang: action.lang
            }, state)
        }

        case UPDATE_CHAT_OFFER_FILTER.TAGS: {
            return u({
                tags: action.tags
            }, state)
        }

        default: {
            return state;
        }
    }


}