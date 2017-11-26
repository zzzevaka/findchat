import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import {Modal, Image, Glyphicon} from 'react-bootstrap';
import ThreadPostComposer from '../PostComposer/ThreadPostComposer';
import {OfferPost} from '../thread/offer-thread';
import UploadImageButton from '../upload-image';
import {AddColorIcon} from '../Icons';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Actions from '../../actions';
import currentUserId from '../../auth';
import {closeModal} from '../../utils';

import './new-offer.css';

const INITIAL_STATE = {
    text: '',
    imagesID: [],
    imagesObj: [],
    showEmojiPicker: false,
}


class NewOfferModal extends PureComponent {

    render() {
        const {threadID, actions, composer, ...rest} = this.props;
        // if (!currentUser) return null;
        return (
            <Modal {...rest} dialogClassName='modal-new-offer'>
                <Modal.Header closeButton>
                    <AddColorIcon className='title-icon' width={20} height={20} />
                    <span className='modal-title'>New offer</span>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <ul>
                            <li>Подсказка 1</li>
                            <li>Подсказка 2</li>
                            <li>Подсказка 3</li>
                        </ul>
                    </div>
                    <ThreadPostComposer
                        ref={e => this.composer = e}
                        threadID={threadID}
                        showImagePreview={true}
                        placeholder='Type right here'
                        allowImage={true}
                        onSubmit={closeModal}
                    />
                </Modal.Body>
            </Modal>
        );
    }

    renderUploadedImages() {
        const images = this.props.composer.imagesObj;
        if (images) {
            if (images[0] && images[0].result !== 'l') {
                return (
                    <div className='image-preview'>
                        <button
                            className='button-no-style attach-preview-delete'
                            onClick={e => this.getComposerInstance().uploadImageRemove(images[0].id)}
                        >
                            <Glyphicon
                                glyph='remove' 
                            />
                        </button>
                        <Image src={ '/img/' + images[0].result.full } />
                    </div>
                );
            }
        }
        return (
            <UploadImageButton
                className='button-add-photo'
                onSuccess={this.imageUploaded}
            >
                <img src='/img/icons/photo.png' />
             </UploadImageButton>
        );
    }

    getComposerInstance() {
        return this.composer.getWrappedInstance().getWrappedComposer();
    }

    imageUploaded = v => {
        this.getComposerInstance().uploadImageCommit(v);
    }

}

function mapStateToProps(state, {threadID}) {
    const {postComposers, uploadImages, users} = state;
    // const currentUser = users[currentUserId()];
    // if (!currentUser) return {};
    let c = {...INITIAL_STATE, ...postComposers['thread' + threadID] };
    c.imagesObj = c.imagesID.map(i => ({...uploadImages[i], id: i}) );
    return {
        // currentUser: currentUser,
        composer: c
    };
}

function mapActionsToProps(dispatch) {
    return {
        actions: bindActionCreators(Actions, dispatch)
    }
}

export default connect(mapStateToProps, mapActionsToProps)(NewOfferModal)