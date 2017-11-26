import React from 'react';
import {Modal} from 'react-bootstrap';
import PostComposer from '../PostComposer';
import {closeModal} from '../../utils';

import './private-message.css';


export default function PrivateMessageModal ({userID, actions: {sendPostToUser}}) {
    return (
        <Modal show={true} onHide={closeModal} dialogClassName='modal-private-message'>
            <Modal.Header closeButton>
                New message
            </Modal.Header>
            <Modal.Body>
                <div>
                </div>
                <PostComposer
                    id={`private_to_${userID}`}
                    onSubmit={post => sendPostToUser(userID, post)}
                    focus
                />
            </Modal.Body>
        </Modal>
    );
}