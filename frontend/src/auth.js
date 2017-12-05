import React from 'react';
import {getCookie} from './utils';

export default function currentUserId() {
    return getCookie('current_user_id');
}

const  DefaultComponent = () => null;

export function loginRequired(WrappedComponent, ComponentIFNotLogin=DefaultComponent) {

    return function(props) {
        return currentUserId()
            ? <WrappedComponent {...props} />
            : <ComponentIFNotLogin />
    }

}