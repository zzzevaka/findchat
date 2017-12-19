import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router-dom';
import {Grid, Row, Col, FormGroup, ControlLabel, FormControl} from 'react-bootstrap';
import MainMenu, {MobileMenu} from '../Menu';
import {SettingsIcon, LoaderIcon} from '../Icons';
import {getAuth, putAuth, updateAuth} from '../../actions';
import API from '../../api';

import './settings-page.css';


import Select from 'react-select';

const EMAIL_REGEXP = /^([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)@([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)[\\.]([a-zA-Z]{2,9})$/;
const PWD_SPEC_CHAR = '!@#$%^&*';
const PWD_REGEXEP = new RegExp(`^[\\w${PWD_SPEC_CHAR}]{4,40}$`);
const MIN_PWD_LENGTH = 4;
const MAX_PWD_LENGTH = 40;

const API_CONN = new API('http://194.67.144.130:8080');

class SettingsPage extends Component {

    render() {
        const {auth} = this.props;
        return (
            <div className='settings-page'>
                <div className='top-fixed-bar'>
                    <div className='title'>
                        <SettingsIcon />
                        <span>Settings</span>
                    </div>
                </div>
                <MobileMenu />
                <Grid fluid className='settings-page-grid main-container'>
                    <Row>
                        <Col sm={2} className='col-menu'>
                            <MainMenu />
                        </Col>
                        <Col sm={8} className='col-settings'>
                            <div className='settings-container'>
                            {
                                auth.password
                                    ? <AuthForms {...this.props} />
                                    : <FormUnblock {...this.props} />
                            }
                            </div>
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        auth: state.auth,
        dispatch: state.dispatch
    }
}

export default connect(mapStateToProps)(SettingsPage);

export class FormUnblock extends Component {

    constructor() {
        super();
        this.state = {
            password: '',
        };
    }

    onSubmit = e => {
        e.preventDefault();
        this.props.dispatch(
            getAuth(this.state.password)
        );
    }

    _inputChange = ({target: {name, value}}) => {
        this.setState({
            [name]: value
        });
    }

    render() {
        const {password} = this.state;
        return (
            <form onSubmit={this.onSubmit}>
                <h4>Enter your password:</h4>
                <FormGroup className='input-round'>
                    <FormControl
                        name='password'
                        type="password"
                        placeholder={'Password'}
                        value={password}
                        autoComplete='off'
                        onChange={this._inputChange}
                    />
                    <FormControl.Feedback />
                </FormGroup>
                <br />
                <button
                    className='button-no-style button-submit'
                >
                    UNBLOCK
                </button>
            </form>
        );
    }

}

function AuthForms(props) {
    return (
        <div>
            <ChangeLoginForm {...props} />
            <hr />
            <ChangePasswordForm {...props} />
            <hr />
        </div>
    );
}


class ChangeLoginForm extends Component {
    
    constructor() {
        super();
        this.state = {
            login: ''
        };
    }

    checkLoginFormat = v => EMAIL_REGEXP.test(v);

    _inputChange = ({target: {name, value}}) => {
        this.setState({
            [name]: value
        })
    }

    onSubmit = e => {
        e.preventDefault();
        this.props.dispatch(
            putAuth({
                login: this.state.login
            }, this.props.auth.password)
        );
        this.setState({
            login: ''
        })
    }

    render() {
        const {login} = this.state;
        const hiddenLogin = this.props.auth.login.replace(/^(.).*(.@.*)/g, '$1***$2');
        const disableSubmit = !this.checkLoginFormat(login);
        const validation = login && disableSubmit ? 'warning' : null;
        return (
            <form onSubmit={this.onSubmit}>
                <h4>Login:</h4>
                <FormGroup validationState={validation} className='input-round'>
                    <FormControl
                        name='login'
                        type="text"
                        placeholder={hiddenLogin}
                        value={login}
                        onChange={this._inputChange}
                        autoComplete='off'
                    />
                    <FormControl.Feedback />
                </FormGroup>
                <br />
                <button
                    className='button-no-style button-submit'
                    disabled={disableSubmit}
                >
                    Submit
                </button>
            </form>
        );
    }

}


class ChangePasswordForm extends Component {

    constructor() {
        super();
        this.state = {
            newPassword: '',
            rptPassword: ''
        }
    }

    checkPasswordFormat = v => PWD_REGEXEP.test(v)

    _inputChange = ({target: {name, value}}) => {
        this.setState({
            [name]: value
        })
    }

    onSubmit = e => {
        e.preventDefault();
        e.preventDefault();
        this.props.dispatch(
            putAuth({
                password: this.state.newPassword
            }, this.state.newPassword)
        );
        this.setState({
            newPassword: '',
            rptPassword: ''
        })
    }

    render() {
        const {
            newPassword,
            rptPassword
        } = this.state;
        const pwdValid = this.checkPasswordFormat(newPassword) ? null : 'warning';
        const rptPwdValid = newPassword === rptPassword ? null : 'warning';
        const disableSubmit = rptPwdValid || pwdValid;
        return (
            <form onSubmit={this.onSubmit}>
                <h4>Password:</h4>
                <FormGroup validationState={newPassword && pwdValid} className='input-round'>
                    <FormControl
                        name='newPassword'
                        type="password"
                        placeholder='New password'
                        value={newPassword}
                        onChange={this._inputChange}
                        autoComplete='off'
                    />
                    <FormControl.Feedback />
                </FormGroup>
                <FormGroup validationState={rptPassword && rptPwdValid} className='input-round'>
                    <FormControl
                        name='rptPassword'
                        type="password"
                        placeholder='Repeat new password'
                        value={rptPassword}
                        onChange={this._inputChange}
                        autoComplete='off'
                    />
                    <FormControl.Feedback />
                </FormGroup>
                <br />
                <button
                    className='button-no-style button-submit'
                    disabled={disableSubmit}
                >
                    Submit
                </button>
            </form>
        );
    }

}