import { UPDATE_AUTH } from '../constants/ActionTypesConstants';

const INITIAL_STATE = {};

export default function auth(state=INITIAL_STATE, action) {
    switch(action.type) {
        case UPDATE_AUTH: {
            return action.auth;
        }

        default: {
            return state;
        }

    }
}