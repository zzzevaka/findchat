import React from 'react';
import {Link} from 'react-router';
import {UserAvatar} from '../UserPage';

import './notifies.css';

export function ChatOfferAnswerSuccess({thumbnail, chatID, ...rest}) {
    return (
        <div className='notify-content notify-offer-answer-success' {...rest}>
            <UserAvatar thumbnail={thumbnail} />
            <span>Go to chat</span>
        </div>
    );
}

export function ChatOfferAnswerDoubleAnswer(props) {
    return (
        <div className='notify-content' {...props}>
            <span>You've answered this offer early</span>
        </div>
    );
}

export function UnknownError(props) {
    return (
        <div className='notify-content' {...props}>
            An error has occured. Please, try later
        </div>
    )
}

export function EditingSuccess(props) {
    return (
        <div className='notify-content' {...props}>
            Changes were made successfully
        </div>
    ) 
}