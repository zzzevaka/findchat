import u from 'updeep';
import { SEARCH_USERS_UPDATE } from '../constants/ActionTypesConstants';

const initialState = {
    usersID: [],
    last404: false
}

export default function searchUsers(state=initialState, action) {

    switch(action.type) {

        case SEARCH_USERS_UPDATE: {
            return {
                last404: false,
                usersID: u(
                    action.usersID,
                    action.clearOld ? {} : state.usersID
                )
            }
        }

        default: {
            return state;
        }

    }

}
