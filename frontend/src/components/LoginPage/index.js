import React, {PureComponent} from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {Grid, Row, Col, FormGroup, FormControl, Glyphicon} from 'react-bootstrap';
import classNames from 'classnames';
import { translate } from 'react-i18next';
import { withRouter, Link } from 'react-router-dom';
import API from '../../api';
import {parseHistorySearch} from '../../utils';

// import './login-page.css';

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
        const {t} = this.props;
        return (
            <div className='login-page-wrapper'>
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
                                        <Link className='find-link' to='/search/chat_offers'>
                                            {t('Find')}
                                        </Link>
                                        &nbsp;{t('intresting topics')}.
                                    </p>
                                    <p
                                        key='slogan-wave-2'
                                        className='slogan-wave-2'
                                    >{t('Suggest yours')}.</p>
                                    <p
                                        key='slogan-wave-3'
                                        className='slogan-wave-3'
                                    >{t('Chat')}.</p>
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
                            : <i>{t('Join')}</i>
                    }
                </div>
            </div>
        )
    }

}

LoginPage = translate('translations')(LoginPage);
export default withRouter(LoginPage);

function LoginForm({t}) {
    return (
        <div className='login-form'> 
            <p className='header'>{t('Join us')}:</p>
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

LoginForm = translate('translations')(LoginForm);
export {LoginForm};


function TermsAndPrivacyLinks({t, ...rest}) {
    return (
        <div className='link-terms' {...rest}>
            <a href="#" className='link-no-style'>{t('Terms of use')}</a>
            <span>/</span>
            <a href="#" className='link-no-style'>{t('Privacy policy')}</a>
        </div>
    );
}

TermsAndPrivacyLinks = translate('translations')(TermsAndPrivacyLinks);
export {TermsAndPrivacyLinks};

