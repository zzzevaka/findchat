import React, {Component} from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';

import { FileChoiseButton } from '../Buttons.react';
import ImageEditModal from './ImageEditModal';

import { uploadImgSource, uploadImage } from '../../actions';
import Notifications from 'react-notification-system-redux';


import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../../actions';

const MAX_FILE_SIZE = 10485760;
const ELEVATION_MSG = 'the file is too large';
const NOTIFICATION_POS = 'tr';

class UploadImageButton extends Component {
    
    static propTypes = {
        maxFileSize: PropTypes.number.isRequired,
        elevationMessage: PropTypes.string.isRequired,
        notificationPostion: PropTypes.string.isRequired,
        cropRatio: PropTypes.number,
    }

    static defaultProps = {
        maxFileSize: MAX_FILE_SIZE,
        elevationMessage: ELEVATION_MSG,
        notificationPostion: NOTIFICATION_POS,
    }

    constructor() {
        super();
        this.state = {};
    }

    _onFileChanged = e => {
        e.preventDefault();
        this.setFile(e.target.files[0]);
        e.target.value = '';
    }

    setFile = file => {
        const {
            maxFileSize,
            elevationMessage,
            notificationPostion,
            dispatch
        } = this.props;
        if (file.size > maxFileSize) {
            dispatch(
                Notifications.error({
                    position: notificationPostion,
                    message: elevationMessage
                })
            );
        } else {
            const id = shortid.generate();
            dispatch(uploadImgSource(id, file));
            this.setState({storeKey: id});
        }
    }

    _onCommit(storeKey, canvas) {
        const {dispatch, onSuccess} = this.props;
        onSuccess(storeKey);        
        this._onCancel();
        dispatch(
            uploadImage(storeKey, {
                src: canvas.toDataURL('image/jpeg', 0.6),
            })
        )
    }

    _onCancel() {
        this.setState({storeKey: undefined});
    }

    render() {
        const {
            maxFileSize,
            elevationMessage,
            notificationPostion,
            dispatch,
            uploadedImages,
            onSuccess,
            ...rest
        } = this.props;
        const {storeKey} = this.state;

        return (
            <div {...rest}>
                <FileChoiseButton
                    ref={e => this.button = e}
                    onChange={this._onFileChanged}
                >
                    {this.props.children}
                </FileChoiseButton>
                {
                storeKey && <ImageEditModal
                    storeKey={storeKey}
                    onCommit={this._onCommit.bind(this)}
                    onCancel={this._onCancel.bind(this)}
                    cropRatio={this.props.cropRatio}
                    uploadedImages={uploadedImages}
                    dispatch={dispatch}
                    />
                }
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        uploadedImages: state.uploadImages,
        dispatch: state.dispatch
    };
}

export default connect(mapStateToProps, null, null, {withRef: true})(UploadImageButton);