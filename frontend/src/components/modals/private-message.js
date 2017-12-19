import React from 'react';
import {Modal} from 'react-bootstrap';
import PostComposer from '../PostComposer';

import './private-message.css';


export default function PrivateMessageModal ({userID, onSubmit, ...rest}) {
    return (
        <Modal dialogClassName='modal-private-message' {...rest}>
            <Modal.Header closeButton>
                New message
            </Modal.Header>
            <Modal.Body>
                <div>
                </div>
                <PostComposer
                    id={`private_to_${userID}`}
                    onSubmit={post => onSubmit(userID, post)}
                />
            </Modal.Body>
        </Modal>
    );
}
