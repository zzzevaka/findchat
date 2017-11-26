import u from 'updeep';
import { UPDATE_CHAT_OFFERS } from '../constants/ActionTypesConstants';


const initialState = {
    last404: false,
    offers: {}
}

export default function chatOffers(state=initialState, action) {
    
    switch(action.type) {

        case UPDATE_CHAT_OFFERS.SUCCESS: {
            return {
                last404: false,
                offers: u(
                    action.chatOffers,
                    action.clearOld ? {} : state.offers
                )
            };
        }

        default: {
            return state;
        }

    }
}