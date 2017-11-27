import React from 'react';
import PropTypes from 'prop-types';

import { findDOMNode } from 'react-dom';
import { Modal, Image, Button, Glyphicon } from 'react-bootstrap';
import ReactCrop from 'react-image-crop';

import {LoaderIcon} from '../Icons';
import { uploadImage } from '../../actions';

import './image-modal.css';
// import 'react-image-crop/dist/ReactCrop.css';


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
            crop: props.crop
        };
    }
    
    onWindowResize = (e) => this.forceUpdate()
    
    componentDidMount() {
        window.addEventListener(
            'resize',
            this.onWindowResize
        );
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
                <Modal.Body
                    style={{
                        height: `${window.innerHeight - 50}px`
                    }}
                >
                    <div className='image-area'>
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
        const {crop} = this.state;
        const {uploadedImages, storeKey} = this.props;
        const img = uploadedImages[storeKey];
        if (img.src === 'l') {
            return <LoaderIcon />;
        }
        if (crop) {
            return (
                <ReactCrop
                    crop={crop || INITIAL_CROP}
                    src={img.src}
                    keepSelection={true}
                    onChange={this._onCrop}
                />
            )
        } else {
            return (
                <Image
                    className='image-preview'
                    src={img.src}
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
