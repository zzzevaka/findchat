import React, {PureComponent} from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {Grid, Row, Col, FormGroup, FormControl, Glyphicon} from 'react-bootstrap';
import classNames from 'classnames';
import {browserHistory, Link} from 'react-router';
import { connect } from 'react-redux';
import Notifications from 'react-notification-system-redux';
import API from '../../api';

import './login-page.css';

const api = new API('/api_v1');


class LoginPage extends PureComponent {

    constructor() {
        super();
        this.state = {
            showForm: false,
            formType: 'login'
        };
    }

    togglePage = () => {
        this.setState({
            showForm: !this.state.showForm
        });
    }

    switchToLogin = () => this.setState({formType: 'login'});

    switchToRegistration = () => this.setState({formType: 'registration'});

    switchToResetPassword = () => this.setState({formType: 'resetPasswrord'});

    render() {
        const {showForm, formType} = this.state;
        const {notifications, dispatch} = this.props;
        let renderForm = null;
        switch (formType) {
            
            case 'login':
                renderForm = (
                    <div>
                        <LoginForm dispatch={dispatch} />
                    </div>
                );
                break;
            
            case 'registration':
                renderForm = (
                    <div>
                        <RegistrationForm dispatch={dispatch} />
                        <div className='links'>
                            <button
                                className='button-no-style link-style'
                                onClick={this.switchToLogin}
                            >Already have account</button>
                        </div>
                    </div>
                );
                break;

            case 'resetPasswrord':
                renderForm = (
                    <div>
                        <ResetPasswordForm dispatch={dispatch} />
                        <div className='links'>
                            <button
                                className='button-no-style link-style'
                                onClick={this.switchToLogin}
                            >Sign In</button>
                            <span>/</span>
                            <button
                                className='button-no-style link-style'
                                onClick={this.switchToRegistration}
                            >Sign Up</button>
                        </div>
                    </div>
                );
                break;

        }
        return (
            <div className='login-page-wrapper' style={{height: window.innerHeight}}>
                <Notifications notifications={notifications} />
                <Grid fluid className='login-page main-container'>
                    <Row>
                        <ToggleArea sm={6} hidden={showForm}>
                            <div className='toggle-area-wrapper'>
                                <div className='label-area slogan'>
                                    <ReactCSSTransitionGroup
                                        transitionName="slogan"
                                        transitionAppear={true}
                                        transitionEnter={false}
                                        transitionLeave={false}
                                    >
                                        <p
                                            key='slogan-wave-1'
                                            className='slogan-wave-1'
                                        >
                                            <Link className='find-link' to='/search/chat_offers'>Find</Link>
                                            &nbsp;intresting topics.
                                        </p>
                                        <p
                                            key='slogan-wave-2'
                                            className='slogan-wave-2'
                                        >Suggest yours.</p>
                                        <p
                                            key='slogan-wave-3'
                                            className='slogan-wave-3'
                                        >Have fun ;)</p>
                                    </ReactCSSTransitionGroup>
                                </div>
                            </div>
                        </ToggleArea>
                        <ToggleArea sm={6} hidden={!showForm}>
                            <div className='toggle-area-wrapper'>
                                <div className='label-area form-wrapper'>
                                    <div className='form-header'>
                                        <img className='logo' src='/svg/logo_color.svg' />
                                        <img className='site-name' src='/svg/findchat.svg' />
                                    </div>
                                    {renderForm} 
                                    <div className='links' style={{height: '80px', marginTop: '20px', textAlign: 'center'}}>
                                        <a href="#" className='link-no-style'>Terms of use</a>
                                        <span>/</span>
                                        <a href="#" className='link-no-style'>Privacy policy</a>
                                    </div>
                                </div>
                            </div>
                        </ToggleArea>
                    </Row>
                </Grid>
                <div className='footer hidden-md-up'>
                {
                    showForm
                        ? <button onClick={this.togglePage}>Back</button>
                        : <button onClick={this.togglePage}>Sign In / Sign Up</button>
                }        
                </div>
            </div>
        )
    }

}

function mapStateToProps({dispatch, notifications}) {
    return {
        dispatch: dispatch,
        notifications: notifications
    };
}

export default connect(mapStateToProps)(LoginPage);

export function ToggleArea({hidden, className, ...rest}) {
    return <Col {...rest} className={classNames('toggle-area', {'toggle-area-hidden': hidden}, className)} />;
} 


export function LoginForm() {
    return (
        <div className='login-form'> 
            <div className='buttons'>
                <span>Join us:</span>
                <a href='/auth/vk' className='link-no-style'>
                    <img src='/svg/vk.svg' />
                </a>
                <a href='/auth/google' className='link-no-style'>
                    <img src='/svg/google_plus.svg' />
                </a>
                <a href='/auth/facebook' className='link-no-style'>
                    <img src='/svg/fb.svg' />
                </a>
            </div>
        </div>
    );
}


class RegistrationForm extends PureComponent {

    constructor() {
        super();
        this.state = {
            login: {value: '', validation: null},
            password: {value: '', validation: null},
            rptPassword: {value: '', validation: null}
        };
    }

    submit = (e) => {
        e && e.preventDefault();
    }

    _inputChange = ({target: {name, value}}) => {
        this.setState({
            [name]: {...this.state[name], value: value}
        });
    }

    render() {
        const {login, password, rptPassword} = this.state;
        return (
            <div className='registration-form'>
                <form onSubmit={this.submit}>
                    <FormGroup validationState={login.validation} className='input-round'>
                        <FormControl
                            name='login'
                            type="text"
                            placeholder='Email'
                            value={login.value}
                            onChange={this._inputChange}
                        />
                        <FormControl.Feedback />
                    </FormGroup>
                    <FormGroup validationState={password.validation} className='input-round'>
                        <FormControl
                            name='password'
                            type="password"
                            placeholder='Passwrod'
                            value={password.value}
                            onChange={this._inputChange}
                        />
                        <FormControl.Feedback />
                    </FormGroup>
                    <FormGroup validationState={rptPassword.validation} className='input-round'>
                        <FormControl
                            name='rptPassword'
                            type="password"
                            placeholder='Repeat password'
                            value={rptPassword.value}
                            onChange={this._inputChange}
                        />
                        <FormControl.Feedback />
                    </FormGroup>
                </form>
                <div className='buttons'>
                    <FormGroup className='input-round'>
                        <FormControl type='submit' value='Create account'/>
                    </FormGroup>
                </div>
            </div>
        );
    }
}


class ResetPasswordForm extends PureComponent {

    constructor() {
        super();
        this.state = {
            login: {value: '', validation: ''}
        };
    }

    submit = (e) => {
        e && e.preventDefault();
    }

    _inputChange = ({target: {name, value}}) => {
        this.setState({
            [name]: {...this.state[name], value: value}
        });
    }

    render() {
        const {login} = this.state;
        return (
            <div className='reset-password-form'>
                <form onSubmit={this.submit}>
                <FormGroup validationState={login.validation} className='input-round'>
                    <FormControl
                        name='login'
                        type="text"
                        placeholder='Email'
                        value={login.value}
                        onChange={this._inputChange}
                    />
                    <FormControl.Feedback />
                </FormGroup>
                </form>
                <div className='buttons'>
                    <FormGroup className='input-round'>
                        <FormControl type='submit' value='Reset password'/>
                    </FormGroup>
                </div>
            </div>
        );
    }
}


function InputWithStatus(props) {
    return (
        <div className='input-with-status input'>
            <input {...props} />
            <Glyphicon glyph='remove' />
        </div>
    )
}