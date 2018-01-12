import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import ImageEditModal from './ImageEditModal';

import API from '../../api';

const MAX_FILE_SIZE = 10485760;
const ELEVATION_MSG = 'the file is too large';

export default class ImageUloader extends PureComponent {
    
    static propTypes = {
        maxFileSize: PropTypes.number.isRequired,
        elevationMessage: PropTypes.string.isRequired,
        cropRatio: PropTypes.number,
        onSuccess: PropTypes.func.isRequired,
        onUploadStart: PropTypes.func.isRequired,
    }

    static defaultProps = {
        maxFileSize: MAX_FILE_SIZE,
        elevationMessage: ELEVATION_MSG,
        onSuccess: () => {},
        onUploadStart: () => {}
    }

    constructor() {
        super();
        this.api = new API('/api_v1');
        this.state = {
            img: undefined
        };
    }

    _onFileChanged = e => {
        e.preventDefault();
        const {
            maxFileSize,
            elevationMessage,
        } = this.props;
        const file = e.target.files[0];
        if (file.size > maxFileSize) {
            alert(elevationMessage);
        }
        this.setState({
            img: {src: 'l'}
        });
        let fr = new FileReader();
        fr.onloadend = () => {
            this.setSrc(fr.result);
        }
        fr.readAsDataURL(file);
        e.target.value = '';
    }

    setSrc = src => {
        this.setState({
            img: {src: src}
        });
    }

    _onCommit = canvas => {
        const {onSuccess, onUploadStart} = this.props;
        const key = shortid.generate();
        onUploadStart({key: key, status: 'l'});
        this._onCancel();
        this.api.uploadImage({
            src: canvas.toDataURL('image/jpeg', 0.6),
        }).then(
            r => {
                if (r.status !== 200) throw new Error('image not uploaded');
                return r.json()
            }
        ).then(
            j => onSuccess({...j.img, key: key, status: 's'})
        );
    }

    _onCancel = () => {
        this.setState({
            img: undefined
        });
    }

    render() {
        const {
            maxFileSize,
            elevationMessage,
            onSuccess,
            cropRatio,
            ...rest
        } = this.props;
        const {img} = this.state;

        if (!img) return null;

        return (
            <ImageEditModal
                onCommit={this._onCommit}
                onCancel={this._onCancel}
                cropRatio={cropRatio}
                img={img}
                {...rest}
            />
        );
    }
}