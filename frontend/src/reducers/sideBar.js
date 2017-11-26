import u from 'updeep';
import { TOGGLE_SIDEBAR } from '../constants/ActionTypesConstants';

const MIN_WIDTH_DEFAULT_OPEN = 768;

const initialState = {
    open: window.innerWidth >= MIN_WIDTH_DEFAULT_OPEN
}

export default function sideBar(state=initialState, action) {

    switch (action.type) {

        case TOGGLE_SIDEBAR: {
            return u({open: !state.open}, state)
        }

        default: {
            return state;
        }

    }
}