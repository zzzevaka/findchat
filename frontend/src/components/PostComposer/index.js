import React, {Component, PureComponent} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import { Image, Glyphicon } from 'react-bootstrap';
import ContentEditable from 'react-contenteditable';
import EmojiPicker, {emojiImage, Emoji} from '../emoji-picker/emojiPicker';
import ImageUploader from '../upload-image';
import { FileChoiseButton } from '../Buttons.react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../../actions';

import {LoaderIcon} from '../Icons';

import './post-composer.css';

const ENTER_KEY_CODE = 13;
const UPLOADING = 'u';
const INITIAL_STATE = {
    text: '',
    image: undefined,
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

    renderUploadedImages() {
        const {image} = this.props.composer;
        if (!image) return null;
        return (
            <div key={image.key} className='attach-preview' style={{display: image ? 'block' : 'none'}}>
                {
                    image.status === 'l'
                        ? <LoaderIcon />
                        : <div className='attach-preview-item'>
                                <Image src={'/img/' + image.preview} />
                                <button
                                    className='button-no-style attach-preview-delete'
                                    onClick={e => this.uploadImageRemove(image.id)}
                                >
                                    <Glyphicon glyph='remove' />
                                </button>
                            </div>
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
                        {'post-composer-image': allowImage && !composer.image},
                        className
                    )
                }
                {...rest}
            >
                {showImagePreview && this.renderUploadedImages()}
                <div className='post-composer-main post'>
                    <FileChoiseButton
                        className='glyph-button button-image'
                        onChange={this._onImgFileChanged}
                    >
                        <img src='/svg/photo.svg' />
                    </FileChoiseButton>
                    <ImageUploader
                        ref={e => this.imgUploader = e}
                        onSuccess={this.uploadImageCommit}
                        onUploadStart={this.uploadImageCommit}
                    >
                        <img src='/svg/photo.svg' />
                    </ImageUploader>
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
        const {text, image} = composer;
        onSubmit({
            text: text,
            content_id: image ? image.id : null,
        });
        this._updateInStore(INITIAL_STATE);
    }

    _onTextChange = e => {
        this._updateInStore({
            text: e.target.value,
        });
    }

    uploadImageRemove = key => {
        this._updateInStore({
            image: undefined
        });
    }

    uploadImageCommit = img => {
        this._updateInStore({
            image: img
        });
    }

    _onImgFileChanged = e => {
        this.imgUploader._onFileChanged(e);
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
    let composer = {...INITIAL_STATE, ...state.postComposers[id]};
    return { composer: composer };    
}

function mapActionsToProps(dispatch) {
    return { actions: bindActionCreators(actions, dispatch) };
}

export default connect(mapStateToProps, mapActionsToProps, null, {withRef: true})(PostComposer);