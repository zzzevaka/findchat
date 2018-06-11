import React from 'react';
import { Link } from 'react-router-dom';
import './notifies.css';

export const ChatOfferAnswerSuccess = ({ thumbnail, chatID, ...rest }) => {
    return (
        <Link to={ `/chats/${chatID}/` } className="link-no-style">
            <div className='notify-content notify-offer-answer-success' {...rest}>
                <span>Вы ответили на сообщение. Перейти к беседе</span>
            </div>
        </Link>
    );
};

export function ChatOfferAnswerDoubleAnswer(props) {
    return (
        <div className='notify-content' {...props}>
            <span>Вы уже отвечали на это сообщение</span>
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