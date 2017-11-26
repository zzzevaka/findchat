import {getCookie} from './utils';

export default function currentUserId() {
    return getCookie('current_user_id');
}