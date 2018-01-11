import React, {Component} from 'react';
import {Grid, Row, Col, Image, Glyphicon, MenuItem} from 'react-bootstrap';
import classNames from 'classnames';
import { translate } from 'react-i18next';
import {NavLink, Link, Route, Switch, withRouter} from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import MainMemu, {MobileMenu} from '../Menu';
import {TopFixedBarDummy} from '../TopFixedBar';
import {MarsIcon, VenusIcon, MessageIcon} from '../Icons'
import {DropdownTools} from '../Menu/dropdown-tools';

import * as Actions from '../../actions';
import { ChatOfferThread, PhotoThread } from '../thread';

import './user-page.css'


const OFFER_PLACEHOLDER = 'There are no offers yet ;(';
const PHOTO_PLACEHOLDER = 'There are no photos yet ;(';


class UserPage extends Component {

    componentDidMount() {
        this.loadUser();
    }

    loadUser() {
        const {user, actions, match} = this.props;
        actions.loadUsers(match.params.userID);
    }

    chatOfferLoad = (limit, offset, dispatch) => {
        dispatch(
            Actions.loadThread(this.props.user.offer_thread_id, limit, offset)
        );
    }

    photosLoad = (limit, offset, dispatch) => {
        dispatch(
            Actions.loadThread(this.props.user.photo_thread_id, limit, offset)
        );
    }

    renderThread() {
        const {user, auth, match} = this.props;
        if (!user.offer_thread_id) return null;
        const isMyPage = auth.user_id == user.id; 
        return (
            <Switch>
                <Route path={`${match.url}/photos`} render={() => (
                    <PhotoThread
                        threadID={user.photo_thread_id}
                        loadMethod={this.photosLoad}
                        placeholder={PHOTO_PLACEHOLDER}
                        isMyPage={isMyPage}
                    />
                )} />
                <Route path={`${match.url}`} render={() => (
                    <ChatOfferThread
                        threadID={user.offer_thread_id}
                        loadMethod={this.chatOfferLoad}
                        placeholder={OFFER_PLACEHOLDER}
                    />                
                )} />
            </Switch>
        )
    }
    
    renderFollowButton() {
        const {user, actions, t} = this.props;
        if (user.current_user_follows) {
            return (
                <button
                    className='button-no-style'
                    onClick={() => actions.unfollowUser(user.id)}
                >
                    <img src='/svg/like_color.svg' />
                    {t('Unfollow')}
                </button>
            );
        }
        else {
            return (
                <button
                    className='button-no-style'
                    onClick={() => actions.followUser(user.id)}
                >
                    <img src='/svg/like_color.svg' />
                    {t('Follow')}
                </button>
            ); 
        }
    }

    render() {
        const {user, auth, match, history, location, t} = this.props;
        if (!user) return null;
        const isMyPage = auth.user_id == user.id;  
        return (
            <div className='user-page' key={match.params.userID}>
                <MobileMenu />
                <div className='user-info-background'>
                <Grid fluid className='user-page-grid main-container'>
                    <UserOptions  isMyPage={isMyPage} user={user} />
                    <Row>
                        <Col sm={2} className='col-menu'>
                            <MainMemu />
                        </Col>
                        <Col sm={2} className='col-avatar'>
                            <UserAvatar
                                thumbnail={user.thumbnail}
                                avatarID={user.avatar_id}
                                threadID={user.photo_thread_id}
                            />
                            {isMyPage && <div className='button-new-avatar'>
                                <button
                                    className='button-no-style'
                                    onClick={() => history.push(`${match.url}?modalType=new_photo&avatar=1`)}
                                >
                                    <i className='fa fa-plus' />
                                </button>
                            </div>}
                        </Col>
                        <Col sm={6} className='col-user-info'>
                            <div className='user-info'>
                                <p className='name'>
                                    {user.firstname}
                                    <span className='dot'>&bull;</span>
                                    <span className='age'>{user.age}</span>
                                    {
                                        user.gender === 'male' &&
                                        <MarsIcon className='icon-gender icon-mars'/>
                                    }
                                    {
                                        user.gender === 'female' &&
                                        <VenusIcon className='icon-gender icon-venus'/>
                                    }
                                </p>
                                <p className='lang'>{user.lang && user.lang.join(', ')}</p>
                            </div>
                            <UserAbout text={user.about} />
                        </Col>
                    </Row>
                </Grid>
                </div>
                <div className='user-buttons'>
                    {!isMyPage && <button
                        className='button-no-style'
                        onClick={() => {history.push(location.pathname + `?modalType=private_message_composer&userID=${user.id}`)}}
                    >
                        <img src='/svg/message_color.svg' />
                            {t("Message")}
                    </button>}
                    {!isMyPage && this.renderFollowButton()}
                </div>
                <div className='thread-type-switch'>
                    <NavLink
                        exact
                        to={`${match.url}`}
                        className='link-no-style'
                        activeClassName='thread-active'
                        onClick={this.showOffers}
                    >{t("Chat Offers")}</NavLink>
                    <span>/</span>
                    <NavLink
                        to={`${match.url}/photos`}
                        className='link-no-style'
                        activeClassName='thread-active'
                        onClick={this.showOffers}
                    >{t("Photos")}</NavLink>
                </div>
                <div className='thread-area'>
                    {this.renderThread()}
                </div>
            </div>
        )
    }

}

UserPage = translate('translations')(UserPage);


function UserPageTopFixedBar({user, children}) {
    return (
        <TopFixedBarDummy>
            {
                user &&
                    <Link
                        to={`/user/${user.id}`}
                        className='link-no-style user-title'
                    >
                        <UserAvatar thumbnail={user.thumbnail} />
                        <p>{user.firstname}</p>
                    </Link>
            }
            {children}
        </TopFixedBarDummy>
    );
}


function mapStateToProps({users, auth}, props) {
    let {userID, match} = props;
    if (!userID) {
        if (match) {
            userID = match.params.userID;
        }
    }
    return {
        user: users[userID],
        auth: auth
    };
  }
  
  function mapDispatchToProps(dispatch) {

      return {
          actions: bindActionCreators(Actions, dispatch)
      };

  }

UserPageTopFixedBar = connect(mapStateToProps)(UserPageTopFixedBar);
export {UserPageTopFixedBar};

export default connect(mapStateToProps, mapDispatchToProps)(UserPage);  


class UserAbout extends Component {

    constructor() {
        super();
        this.state = {
            opened: false,
            multiline: undefined
        };
    }

    componentDidMount() {
        this._setMultiline();
    }

    componentDidUpdate() {
        this._setMultiline();
    }

    _setMultiline() {
        if (this.state.multiline === undefined && this.inner && this.outer) {
            this.setState({
                multiline: this.inner.clientHeight / this.outer.clientHeight >= 1.5
            });
        }
    }

    toggleOpened = () => this.setState({opened: !this.state.opened})

    render() {
        const {text} = this.props;
        if (!text) return null;
        const {opened, multiline} = this.state;
        const aboutClass = opened ? 'about-opened' : 'about-short';
        const classes = classNames(
            'about',
            opened ? 'about-opened' : 'about-short',
            multiline ? 'about-multiline' : 'about-singleline'
        )
        return (
            <div className={classes}>
                <button
                    className='about-toggle'
                    onClick={this.toggleOpened}
                >
                    <Glyphicon glyph={opened ? 'menu-up' : 'menu-down'} />
                </button>
                <p ref={e => this.outer = e}>
                    <span ref={e => this.inner = e}>{text}</span>
                </p>
            </div>  
        );
    }
}

export function UserAvatar({thumbnail}) {

    return (
        <div className='avatar'>
            <img src={thumbnail ? `/img/${thumbnail}` : '/svg/user.svg'} />
        </div>
    );
}

function UserOptions({isMyPage, user, history, t}) {
    // user browserHistory.push instead Link to avoid error: "cannot appear as a descendant..."
    let items = [];
    let browserHistory = [];
    isMyPage && items.push(
        <MenuItem key='edit_page' onClick={() => history.push('/edit_user')}>
            {t("Edit profile")}
        </MenuItem>
    );
    items.push(
        <MenuItem key='followers' onClick={() => history.push(`/user/${user.id}/follow`)}>
            {t("Followers")}
        </MenuItem>
    );
    isMyPage && items.push(
        <MenuItem key='logout' onClick={() => window.location.href= '/auth/logout'}>
            {t("Logout")}
        </MenuItem>
    );
    return (
        <div className='user-option'>
            <DropdownTools className='button-no-style'>
                {items}
            </DropdownTools>
        </div>
    );
}

UserOptions = translate('translations')(UserOptions);
UserOptions = withRouter(UserOptions);

export {UserOptions};