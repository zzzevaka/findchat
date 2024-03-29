import React from 'react';
import PropTypes from 'prop-types';
import { Image } from 'react-bootstrap';
import shortid from 'shortid';

export class ImageButton extends React.Component {
    
    static propTypes = {
        icon: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        acceptFormats: PropTypes.string,
    }
    
    static defaultProps = {
        icon: "/img/camera.png",
        accept: "image/*",
    }
        
    render() {
        const {icon, onChange, accept} = this.props;
        const id = shortid.generate();
        return (
            <span className={this.props.className}>
                <label htmlFor={id}>
                    <Image src={icon} />
                </label>
                <input
                    id={id}
                    type="file"
                    accept={accept}
                    style={{display: 'none'}}
                    onChange={onChange}
                />
            </span>
        )
    }
}

export class FileChoiseButton extends React.Component {
    
    constructor() {
        super();
        this.id = shortid.generate();
    }

    static propTypes = {
        icon: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        acceptFormats: PropTypes.string
    }
    
    static defaultProps = {
        acceptFormats: "image/*",
    }

    setFile() {
        alert('setfile');
    }
        
    render() {
        const {icon, onChange, acceptFormats, children, ...rest} = this.props;
        return (
            <div {...rest}>
                <label htmlFor={this.id} style={{cursor: 'pointer'}}>
                    {children}
                </label>
                <input
                    ref={e => this.input = e}
                    id={this.id}
                    type="file"
                    accept={acceptFormats}
                    style={{display: 'none'}}
                    onChange={onChange}
                />
            </div>
        )
    }
}
