import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import {Modal, Image, Glyphicon} from 'react-bootstrap';
import ThreadPostComposer from '../PostComposer/ThreadPostComposer';
import {OfferPost} from '../thread/offer-thread';
import UploadImageButton from '../upload-image';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Actions from '../../actions';
import {closeModal} from '../../utils';
import {LoaderIcon} from '../Icons';


import './new-offer.css';

const INITIAL_STATE = {
    text: '',
    imagesID: [],
    imagesObj: [],
    showEmojiPicker: false,
}

const PHOTO_PLACEHOLDER = 'Comment for the photo';

export class NewPostPhotoModal extends PureComponent {

    render() {
        const {
            threadID,
            actions,
            title,
            ...rest} = this.props;
        return (
            <Modal {...rest} dialogClassName='modal-new-post-photo'>
                <Modal.Header closeButton>
                    <img src='/img/icons/icon-plus-black.png' />
                    {title}
                </Modal.Header>
                <Modal.Body>
                    {false && <UploadImageButton
                        className='button-add-photo'
                        onSuccess={this.imageUploaded}
                    >
                        <img src='/img/icons/photo.png' />
                    </UploadImageButton>}
                    { this.renderUploadedImages() }
                    <ThreadPostComposer
                        ref={e => this.composer = e}
                        threadID={threadID}
                        showImagePreview={false}
                        placeholder={PHOTO_PLACEHOLDER}
                        allowImage={false}
                        onSubmit={this.props.onHide}
                    />
                </Modal.Body>
            </Modal>
        );
    }

    renderUploadedImages() {
        const images = this.props.composer.imagesObj;
        console.log(images);
        if (images.length) {
            if (images[0].result !== 'l') {
                return (
                    <div className='image-preview'>
                        <button
                            className='button-no-style attach-preview-delete'
                            onClick={e => this.getComposerInstance().uploadImageRemove(images[0].id)}
                        >
                            <Glyphicon glyph='remove' />
                        </button>
                        <Image src={ '/img/' + images[0].result.full } />
                    </div>
                );
            }
            else {
                return <LoaderIcon />;
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

export default connect(mapStateToProps, mapActionsToProps)(NewPostPhotoModal);