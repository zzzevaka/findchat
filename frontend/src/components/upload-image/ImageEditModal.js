import React from 'react';
import PropTypes from 'prop-types';

import { findDOMNode } from 'react-dom';
import { Modal, Glyphicon } from 'react-bootstrap';
import ReactCrop from 'react-image-crop';
import Cropper from 'react-cropper';
import '../../../node_modules/cropperjs/dist/cropper.css';

import {LoaderIcon} from '../Icons';

import './image-modal.css';


const INITIAL_CROP = {width: 95, height: 95, x: 2.5, y: 2.5};


export default class ImageEditModal extends React.Component {

    static propTypes = {
        storeKey: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number
            ]).isRequired,
        onCommit: PropTypes.func,
        onCancel: PropTypes.func,
        crop: PropTypes.object,
        cropRatio: PropTypes.number,
    }
    
    static defaultProps = {
        onCommit: () => {},
        onCancel: () => {},
    }

    componentDidMount() {
        this.denyBodyScroll();
    }
    
    componentWillUnmount() {
        this.allowBodyScroll();
    }

    denyBodyScroll = () => {
        document.getElementsByTagName('html')[0].classList.add('no-scroll');
        document.getElementsByTagName('body')[0].classList.add('no-scroll');
        this.scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    }
    
    allowBodyScroll = () => {
        document.getElementsByTagName('html')[0].classList.remove('no-scroll');
        document.getElementsByTagName('body')[0].classList.remove('no-scroll');
        document.documentElement.scrollTop = this.scrollTop;
        document.body.scrollTop= this.scrollTop;
    }

    render() {
        const {uploadedImages, storeKey} = this.props;
        const img = uploadedImages[storeKey];
        if (!img) return null;
        return (
            <Modal
                show={true}
                keyboard={true}
                onHide={this._cancel}
                animation={false}
                dialogClassName='modal-edit-image'
            >
                <div className='image-area'>
                    { this._renderImageArea() }
                </div>
            </Modal>
        )
    }

    _renderImageArea() {
        const {uploadedImages, storeKey, cropRatio} = this.props;
        const img = uploadedImages[storeKey];
        if (img.src === 'l') {
            return <LoaderIcon />;
        }
        return [
            <Cropper
                className='image-cropper'
                ref={e => this.cropper = e}
                autoCrop={cropRatio ? true : false}
                dragMode='move'
                aspectRatio={cropRatio}
                autoCropArea={1}
                src={img.src}
                autoCrop={cropRatio ? true : false}
                background={false}
            />,
            <div className='image-tools'>
                <button
                    className='button-no-style'
                    onClick={() => this.cropper.setDragMode('move')}
                >
                    <i class="fa fa-arrows fa" />
                </button>
                <button
                    className='button-no-style'
                    onClick={this._toggleCrop}
                >
                    <i class="fa fa-crop fa" />
                </button>
                <button
                    className='button-no-style'
                    onClick={() => this.cropper.zoom(0.1)}
                >
                    <i class="fa fa-search-plus fa" />
                </button>
                <button
                    className='button-no-style'
                    onClick={() => this.cropper.zoom(-0.1)}
                >
                    <i class="fa fa-search-minus fa" />
                </button>
                <button
                    className='button-no-style'
                    onClick={() => this.cropper.rotate(-90)}
                >
                    <i class="fa fa-rotate-left" />
                </button>
                <button
                    className='button-no-style'
                    onClick={() => this.cropper.rotate(90)}
                >
                    <i class="fa fa-rotate-right" />
                </button>
                <button
                    className='button-no-style'
                    onClick={this._reset}
                >
                    <i class="fa fa-refresh fa" />
                </button>
                <div className='delimeter' />
                <button
                    className='button-no-style button-close'
                    onClick={this._cancel}
                >
                    <i class="fa fa-close fa" />
                </button>
                <button
                    className='button-no-style button-commit'
                    onClick={this._commit}
                >
                    <i className="fa fa-check fa" />
                </button>
            </div>
        ];
    }

    _reset = () => {
        console.log(this.cropper.cropper.dragBox.dataset.action)
        this.cropper.reset();
        if (!this.props.cropRatio) {
            this.cropper.clear();
        }
    }

    _toggleCrop = () => {
        if (this.cropper.cropper.dragBox.dataset.action === 'crop') {
            if (!this.props.cropRatio) this.cropper.clear();
        }
        else {
            this.cropper.setDragMode('crop');
        }
    }

    _commit = () => {
        const {storeKey, onCommit} = this.props;
        onCommit(storeKey, this.cropper.getCroppedCanvas());
    }
    
    _cancel = () => {
        this.props.onCancel();
    }
}
