import React, {Component, PureComponent} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import { Image, Glyphicon } from 'react-bootstrap';
import ContentEditable from 'react-contenteditable';
import EmojiPicker, {emojiImage, Emoji} from '../emoji-picker/emojiPicker';
import UploadImageButton from '../upload-image';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../../actions';

import {LoaderIcon} from '../Icons';

import './post-composer.css';

const ENTER_KEY_CODE = 13;
const UPLOADING = 'u';
const INITIAL_STATE = {
    text: '',
    imagesID: [],
    showEmojiPicker: false
}

class PostComposer extends PureComponent {

    static propTypes = {
        onSubmit: PropTypes.func.isRequired,
        composer: PropTypes.object,
        keepState: PropTypes.bool,
        focus: PropTypes.bool,
        placeholder: PropTypes.string,
        allowImage: PropTypes.bool.isRequired,
        allowEmoji: PropTypes.bool.isRequired,
        showImagePreview: PropTypes.bool.isRequired
    };

    static defaultProps = {
        onSubmit: () => {},
        keepState: true,
        allowImage: true,
        allowEmoji: true,
        showImagePreview: true
    }

    constructor(props) {
        super(props);
        this.state = {
            ...props.composer,
            showEmojiPicker: false,
            multiline: false
        };
    }

    componentDidMount() {
        const {composer, focus} = this.props;
        if (focus) {
            ReactDOM.findDOMNode(this.textarea).focus();
        }
    }

    getUploadedImages() {
        const {imagesObj} = this.props.composer;
        return imagesObj;
    }

    renderUploadedImages() {
        const images = this.getUploadedImages();
        return (
            <div className='attach-preview' style={{display: images.length ? 'block' : 'none'}}>
                {
                    images.map(i => {
                        if (!i) return null;
                        if (i.result === 'l') {
                            return <LoaderIcon />;
                        }
                        else {
                            return (
                                <div className='attach-preview-item'>
                                    <Image key={i} src={'/img/' + i.result.preview} />
                                    <button
                                        className='button-no-style attach-preview-delete'
                                        onClick={e => this.uploadImageRemove(i.id)}
                                    >
                                        <Glyphicon glyph='remove' />
                                    </button>
                                </div>
                            );
                        }
                    })
                }
            </div>
        );
    }

    render() {
        const {
            id,
            composer,
            className,
            onSubmit,
            keepState,
            focus,
            uploadImages,
            placeholder,
            allowImage,
            allowEmoji,
            showImagePreview,
            actions,
            ...rest
        } = this.props;
        const {showEmojiPicker, text} = composer;
        let submitDisabled = false;
        return (
            <div
                className={
                    classNames(
                        'post-composer',
                        {'post-composer-image': allowImage && !composer.imagesID.length},
                        className
                    )
                }
                {...rest}
            >
                {showImagePreview && this.renderUploadedImages()}
                <div className='post-composer-main post'>
                    <UploadImageButton
                        className='glyph-button button-image'
                        onSuccess={this.uploadImageCommit}
                    >
                        <img src='/svg/photo.svg' />
                    </UploadImageButton>
                    <ContentEditable
                        ref={e => this.textarea = e}
                        onFocus={this._hideEmojiPicker}
                        html={text}
                        className='textarea'
                        onChange={this._onTextChange}
                        onKeyDown={this._onTextKeyDown}
                        placeholder={placeholder}
                    />
                    {allowEmoji && <img
                        src='/svg/smile.svg'
                        onClick={showEmojiPicker ? this._hideEmojiPicker : this._showEmojiPicket}
                        className='glyph-button button-emoji'
                    />}
                    {this._getSubmitButton(submitDisabled)}
                </div>
                {
                    allowEmoji && showEmojiPicker && <EmojiPicker onItemSelect={this._addEmoji} />
                }
            </div>
        )
    }

    _updateInStore(v) {
        const {id, actions} = this.props;
        actions.updatePostComposers({[id]: v});
    }

    _getSubmitButton(disabled) {
        const {composer} = this.props;
        const classes = classNames('glyph-button', 'button-send', {'button-send-disabled': disabled})
        return (composer && composer.status === UPLOADING)
            ? <Image src={'/img/loading.gif'} className={classes} />
            : <img
                src='/svg/send_color.svg'
                className={classes}
                onClick={disabled ? () => {} : this._onSubmit}
            />
    }

    _onTextKeyDown = e => {
        if (e.keyCode === ENTER_KEY_CODE && !e.shiftKey) {
            e.preventDefault();
            this._onSubmit(e);
        }
    }

    _onSubmit = () => {
        const {onSubmit, composer} = this.props;
        const {text, imagesObj} = composer;
        if (!(text || imagesObj.length)) return; 
        onSubmit({
            text: text,
            content_id: imagesObj.length ? imagesObj[0].result.id : null,
        });
        this._updateInStore(INITIAL_STATE);
    }

    _onTextChange = e => {
        this._updateInStore({
            text: e.target.value,
        });
    }

    uploadImageRemove = imgID => {
        const {composer} = this.props;
        this._updateInStore({
            imagesID: composer.imagesID.filter(id => id !== imgID)
        });
    }

    uploadImageCommit = imgID => {
        const {composer} = this.props;
        this._updateInStore({
            imagesID: composer.imagesID.concat(imgID)
        });
    }

    _showEmojiPicket = () => {
        this._updateInStore({
            showEmojiPicker: true
        });
    }

    _hideEmojiPicker = () => {
        this._updateInStore({
            showEmojiPicker: false
        });
    }

    _toggleEmojiPicker = () => {
        this._updateInStore({
            showEmojiPicker: !this.props.composer.showEmojiPicker
        });
    }

    _addEmoji = e => {
        this._updateInStore({
            text: this.props.composer.text + emojiImage(e.id)
        });
    }
}


function mapStateToProps(state, {id}) {
    const {postComposers, uploadImages} = state;
    let composer = {...INITIAL_STATE, ...postComposers[id]};
    composer.imagesObj = composer.imagesID.map(i => ({...uploadImages[i], id: i}) );
    return { composer: composer };    
}

function mapActionsToProps(dispatch) {
    return { actions: bindActionCreators(actions, dispatch) };
}

export default connect(mapStateToProps, mapActionsToProps, null, {withRef: true})(PostComposer);