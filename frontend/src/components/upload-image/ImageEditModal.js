import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Modal } from 'react-bootstrap';
import Cropper from 'react-cropper';
import '../../../node_modules/cropperjs/dist/cropper.css';

import {LoaderIcon} from '../Icons';

import './image-modal.css';


export default class ImageEditModal extends React.Component {

    static propTypes = {
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
        const {img} = this.props;
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
        const {img, cropRatio, cropperClassName} = this.props;
        if (img.src === 'l') {
            return <LoaderIcon />;
        }
        return [
            <Cropper
                key='crpr'
                className={classNames('image-cropper', cropperClassName)}
                ref={e => this.cropper = e}
                autoCrop={cropRatio ? true : false}
                dragMode='move'
                aspectRatio={cropRatio}
                autoCropArea={1}
                src={img.src}
                background={false}
            />,
            <div className='image-tools' key='tls'>
                <button
                    className='button-no-style'
                    onClick={() => this.cropper.setDragMode('move')}
                >
                    <i className="fa fa-arrows fa" />
                </button>
                <button
                    className='button-no-style'
                    onClick={this._toggleCrop}
                >
                    <i className="fa fa-crop fa" />
                </button>
                <button
                    className='button-no-style'
                    onClick={() => this.cropper.zoom(0.1)}
                >
                    <i className="fa fa-search-plus fa" />
                </button>
                <button
                    className='button-no-style'
                    onClick={() => this.cropper.zoom(-0.1)}
                >
                    <i className="fa fa-search-minus fa" />
                </button>
                <button
                    className='button-no-style'
                    onClick={() => this.cropper.rotate(-90)}
                >
                    <i className="fa fa-rotate-left" />
                </button>
                <button
                    className='button-no-style'
                    onClick={() => this.cropper.rotate(90)}
                >
                    <i className="fa fa-rotate-right" />
                </button>
                <button
                    className='button-no-style'
                    onClick={this._reset}
                >
                    <i className="fa fa-refresh fa" />
                </button>
                <div className='delimeter' />
                <button
                    className='button-no-style button-close'
                    onClick={this._cancel}
                >
                    <i className="fa fa-close fa" />
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
        this.props.onCommit(this.cropper.getCroppedCanvas());
    }
    
    _cancel = () => {
        this.props.onCancel();
    }
}
