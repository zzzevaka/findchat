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

import './new-offer.css';

const INITIAL_STATE = {
    text: '',
    imagesID: [],
    imagesObj: [],
    showEmojiPicker: false,
}


class NewOfferModal extends PureComponent {

    render() {
        const {threadID, actions, composer, onHide, ...rest} = this.props;
        return (
            <Modal {...rest} onHide={onHide} dialogClassName='modal-new-offer'>
                <Modal.Header closeButton>
                    <AddColorIcon className='title-icon' />
                    <span className='title-text'>New offer</span>
                </Modal.Header>
                <Modal.Body>
                    <div className='help-block-wrapper'>
                        <ul className='help-block'>
                            <li>
                                <h4 className='help-block__header'>Tooltips:</h4>
                                <ul className='tooltip-list help-block__content'>
                                    <li>
                                        Suggest a topic which may be interesting for another people.
                                    </li>
                                    <li>
                                        Use hashtags and pictures to attract attention to your topic
                                    </li>
                                </ul>
                            </li>
                            <li className='example'>
                                <h4 className='help-block__header'>Example:</h4>
                                <ul className='tooltip-list help-block__content'>
                                    <li>
                                        Let's talk about #football ;)
                                    </li>
                                    <li>
                                        Have you seen #game_of_thrones? I realy like this show!
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                    <ThreadPostComposer
                        ref={e => this.composer = e}
                        threadID={threadID}
                        showImagePreview={true}
                        placeholder='Type right here'
                        allowImage={true}
                        onSubmit={onHide}
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