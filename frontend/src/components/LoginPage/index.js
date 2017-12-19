import React, {PureComponent} from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {Grid, Row, Col, FormGroup, FormControl, Glyphicon} from 'react-bootstrap';
import classNames from 'classnames';
import { withRouter, Link } from 'react-router-dom';
import API from '../../api';
import {parseHistorySearch} from '../../utils';

import './login-page.css';

const api = new API('/api_v1');


class LoginPage extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            showForm: parseHistorySearch(props.history).showForm ? true : false
        };
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

    togglePage = () => {
        this.setState({
            showForm: !this.state.showForm
        });
    }

    switchToLogin = () => this.setState({formType: 'login'});

    switchToRegistration = () => this.setState({formType: 'registration'});

    switchToResetPassword = () => this.setState({formType: 'resetPasswrord'});

    render() {
        const {showForm} = this.state;
        return (
            <div className='login-page-wrapper'>
                <div className='header'>
                    <div className='logo'>
                        <img className='logo-icon' src='/svg/logo_color.svg' />
                        <img className='logo-title' src='/svg/findchat.svg' />
                    </div>
                </div>
                <Grid fluid className='login-page-grid main-container'>
                    <Row>
                        <Col sm={6} className={classNames('col-slogan', {'col-hidden-up': showForm})}>
                            <div className='slogan'>
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
                                    >Chat.</p>
                                </ReactCSSTransitionGroup>
                            </div>
                        </Col>
                        <Col sm={6} className='col-form'>
                            <LoginForm />
                        </Col>
                    </Row>
                </Grid>
                <div className='footer hidden-md-up' onClick={this.togglePage}>
                    {
                        showForm
                            ? <i class="fa fa-sort-asc" aria-hidden="true"></i>
                            : <i>Join</i>
                    }
                </div>
            </div>
        )
    }

}

export default withRouter(LoginPage);

export function LoginForm() {
    return (
        <div className='login-form'> 
            <p className='header'>Join us:</p>
            <div className='buttons'>
                <a href='/auth/vk' className='link-no-style'>
                    <img src='/svg/vk.svg' />
                </a>
                <a href='/auth/google' className='link-no-style'>
                    <img src='/svg/google_plus.svg' />
                </a>
                <a href='/auth/facebook' className='link-no-style'>
                    <img src='/svg/fb.svg' />
                </a>
                <TermsAndPrivacyLinks />
            </div>
        </div>
    );
}


function TermsAndPrivacyLinks(props) {
    return (
        <div className='link-terms' {...props}>
            <a href="#" className='link-no-style'>Terms of use</a>
            <span>/</span>
            <a href="#" className='link-no-style'>Privacy policy</a>
        </div>
    );
}
