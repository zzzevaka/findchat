import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import {Modal, Image, Glyphicon} from 'react-bootstrap';
import PostComposer from '../PostComposer';
import {OfferPost} from '../thread/offer-thread';
import ImageUploader from '../upload-image';
import { FileChoiseButton } from '../Buttons.react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Actions from '../../actions';
import {LoaderIcon} from '../Icons';


import './new-offer.css';

const INITIAL_STATE = {
    text: '',
    images: [],
    showEmojiPicker: false,
}

const PHOTO_PLACEHOLDER = 'Comment for the photo';

export class NewPostPhotoModal extends PureComponent {

    render() {
        const {
            threadID,
            actions,
            title,
            cropRatio,
            cropperClassName,
            ...rest
        } = this.props;
        return (
            <Modal {...rest} dialogClassName='modal-new-post-photo'>
                <Modal.Header closeButton>
                    <img src='/svg/photo_color.svg' className='icon' />
                    {title}
                </Modal.Header>
                <Modal.Body>
                    { this.renderUploadedImages() }
                    <ImageUploader
                        ref={e => this.imgUploader = e}
                        onSuccess={this.imageUploaded}
                        onUploadStart={this.imageUploaded}
                        cropRatio={this.props.cropRatio}
                        cropperClassName={cropperClassName}
                    />
                    <PostComposer
                        ref={e => this.composer = e}
                        id={`thread${threadID}`}
                        showImagePreview={false}
                        placeholder={PHOTO_PLACEHOLDER}
                        allowImage={false}
                        onSubmit={this.onSubmit}
                    />
                </Modal.Body>
            </Modal>
        );
    }

    onSubmit = post => {
        const {threadID, submitAction, onHide, location} = this.props;
        submitAction(
            {thread_id: threadID, ...post},
            `thread${threadID}`
        );
        onHide();
    }

    renderUploadedImages() {
        const {image} = this.props.composer;
        if (image) {
            if (image.status !== 'l') {
                return (
                    <div key={image.key} className='image-preview'>
                        <button
                            className='button-no-style attach-preview-delete'
                            onClick={e => this.getComposerInstance().uploadImageRemove(image.id)}
                        >
                            <Glyphicon glyph='remove' />
                        </button>
                        <Image src={ '/img/' + image.full } />
                    </div>
                );
            }
            else {
                return <LoaderIcon />;
            }
        }
        return (
             <FileChoiseButton
                key='fbtn'
                onChange={this._onFileChanged}
                className='button-add-photo'
             >
                <img src='/svg/photo_color.svg' />
            </FileChoiseButton>
        );
    }

    _onFileChanged = e => {
        this.imgUploader._onFileChanged(e);
    }

    getComposerInstance() {
        return this.composer.getWrappedInstance();
    }

    imageUploaded = img => {
        this.getComposerInstance().uploadImageCommit(img);
    }

}

function mapStateToProps(state, {threadID}) {
    const {postComposers, users} = state;
    let c = {...INITIAL_STATE, ...postComposers['thread' + threadID] };
    return {
        composer: c
    };
}

function mapActionsToProps(dispatch) {
    return {
        actions: bindActionCreators(Actions, dispatch)
    }
}

export default connect(mapStateToProps, mapActionsToProps)(NewPostPhotoModal);
