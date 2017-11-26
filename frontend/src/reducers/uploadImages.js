import { UPDATE_UPLOAD_IMAGES } from '../constants/ActionTypesConstants';
import u from 'updeep';

export default function uploadImages(state={}, action) {

    switch (action.type) {

        case UPDATE_UPLOAD_IMAGES: {
            const newState = u(action.uploadImages, state);
            console.log(newState);
            return newState;
        }

        default: {
            return state;
        }
    }

}
