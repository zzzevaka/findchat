import React from 'react';
import PropTypes from 'prop-types';

import { findDOMNode } from 'react-dom';
import { Modal, Image, Button, Glyphicon } from 'react-bootstrap';
import ReactCrop from 'react-image-crop';

import {LoaderIcon} from '../Icons';
import { uploadImage } from '../../actions';

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
        crop: PropTypes.object
    }
    
    static defaultProps = {
        onCommit: () => {},
        onCancel: () => {},
    }
    
    constructor(props) {
        super(props);
        this.state = {
            crop: props.crop,
            imgSize: []
        };
    }
    
    onWindowResize = (e) => this.forceUpdate()
    
    componentDidMount() {
        this.denyBodyScroll();
    }
    
    componentWillUnmount() {
        this.allowBodyScroll();
    }
    
    componentDidUpdate() {
        if (!this.state.imgSize.length) this.getImageSize();
    }
    
    getImageSize() {
        if (!this.imageArea) return [];
        const {uploadedImages, storeKey} = this.props;
        const img = uploadedImages[storeKey];
        let imgEl = document.createElement('img');
        imgEl.onload = () => {
            const ratio = Math.min(
                this.imageArea.clientWidth / imgEl.width,
                this.imageArea.clientHeight / imgEl.height
            );
            this.setState({
                imgSize: [
                    imgEl.width * ratio,
                    imgEl.height * ratio
                ]
            });
        }
        imgEl.setAttribute('src', img.src);
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
        const {crop} = this.state;
        return (
            <Modal
                show={true}
                keyboard={true}
                onHide={this._cancel.bind(this)}
                animation={false}
                backdrop={crop ? 'static' : true}
                dialogClassName='modal-edit-image'
            >
                <Modal.Header closeButton>
                    Upload image
                </Modal.Header>
                <Modal.Body>
                    <div
                        className='image-area'
                        ref={e => this.imageArea = e}
                    >
                        { this._renderImageArea() }
                    </div>
                    <div className='image-footer'>
                        <Glyphicon
                            className='button-no-style button-submit'
                            onClick={this._commit.bind(this)}
                            glyph='ok'
                        />
                        {
                            !this.props.crop  && (
                                <Glyphicon
                                    className='button-resize'
                                    glyph='resize-small'
                                    onClick={this._toggleCrop}
                                />
                            )
                        }
                    </div>
                </Modal.Body>
            </Modal>
        )
    }

    _renderImageArea() {
        const {crop, imgSize} = this.state;
        const {uploadedImages, storeKey} = this.props;
        const img = uploadedImages[storeKey];
        if (img.src === 'l' || !imgSize.length) {
            return <LoaderIcon />;
        }
        if (crop) {
            return (
                <div
                    style={{
                        width: imgSize[0],
                        height: imgSize[1],
                        margin: 'auto'
                    }}
                >
                    <ReactCrop
                        crop={crop || INITIAL_CROP}
                        src={img.src}
                        keepSelection={true}
                        onChange={this._onCrop}
                    />
                </div>
                    
            );
        } else {
            return (
                <Image
                    className='image-preview'
                    src={img.src}
                    style={{
                        width: imgSize[0],
                        height: imgSize[1]
                    }}
                />
            )
        }
    }

    // for right ReactCrop initial state
    // _onImageLoaded(perc, img, pixel) {
    //     this._onCrop(perc, pixel);
    // }

    _onCrop = (crop) => {
        console.log(crop);
        this.setState({crop: crop});
    }
    
    _toggleCrop = () => {
        this.setState({
            crop: this.state.crop ? null : INITIAL_CROP         
        });
    }

    _uploadToServer() {
        const {uploadedImages, dispatch, storeKey} = this.props;
        const {crop} = this.state;
        dispatch(
            uploadImage(storeKey, {
                src: uploadedImages[storeKey].src,
                crop: crop
            })
        );
    }

    _commit() {
        this._uploadToServer();
        this.props.onCommit(this.props.storeKey);
    }
    
    _cancel() {
        this.props.onCancel();
    }
}
