import React, {Component} from 'react';
import {Grid, Row, Col, Image, Glyphicon, MenuItem} from 'react-bootstrap';
import classNames from 'classnames';
import {browserHistory, Link} from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import MainMemu, {MobileMenu} from '../Menu';
import {MarsIcon, VenusIcon, MessageIcon} from '../Icons'
import {DropdownTools} from '../Menu/dropdown-tools';


import * as Actions from '../../actions';
import {showModal, getModalUrl} from '../../utils';
import currentUserId from '../../auth';
import { ChatOfferThread, PhotoThread } from '../thread';

import './user-page.css'


const OFFER_PLACEHOLDER = 'There are no offers yet ;(';
const PHOTO_PLACEHOLDER = 'There are no photos yet ;(';


class UserPage extends Component {

    constructor() {
        super();
        this.state = {
            showPhotos: false
        }
    }

    shouldComponentUpdate(nProps, nState) {
        if (this.state !== nState) return true;
        return this.props.user !== nProps.user;
    }

    componentDidMount() {
        this.loadUser();
    }

    loadUser() {
        const {user, actions, params} = this.props;
        !user && actions.loadUsers(params.userID);
    }

    showPhotos = () => {
        this.setState({'showPhotos': true});
    }

    showOffers = () => {
        this.setState({'showPhotos': false});
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

    render() {
        const {user, params} = this.props;
        if (!user) return null;
        console.log(user);
        const isMyPage = currentUserId() == user.id;  
        const {showPhotos} = this.state;
        return (
            <div className='user-page' key={params.userID}>
                <div className='top-fixed-bar'>
                    <div className='company_title'>
                        <img src='/svg/logo_color.svg' className='logo' />
                        <img src='/svg/findchat.svg' className='logo_name'/>
                    </div>
                </div>
                <MobileMenu />
                <div className='user-info-background'>
                <Grid fluid className='user-page-grid main-container'>
                    <UserOptions  isMyPage={isMyPage} />
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
                        </Col>
                        <Col sm={6} className='col-user-info'>
                            <div className='user-info'>
                                <p className='name'>
                                    {user.firstname}
                                    <span className='dot'>&bull;</span>
                                    <span className='age'>{user.age}</span>
                                    <MarsIcon
                                        className='icon-male'
                                    />
                                </p>
                                <p className='lang'>{user.lang && user.lang.join(', ')}</p>
                            </div>
                            <UserAbout text={user.about} />
                        </Col>
                    </Row>
                </Grid>
                </div>
                <div className='user-buttons'>
                    {isMyPage && <button
                        className='button-no-style button-new-offer'
                        onClick={() => {showModal('modalType=new_chat_offer')}}
                        style={{borderRight: '1px solid #ddd'}}
                    >
                        <img src='/svg/add_color.svg' />
                            New offer
                    </button>}
                    {isMyPage && <button
                        className='button-no-style'
                        onClick={() => {showModal('modalType=new_photo')}}
                    >
                        <img src='/svg/photo_color.svg' />
                        New photo
                    </button>}
                    {!isMyPage && <button
                        className='button-no-style'
                        onClick={() => {showModal(`modalType=private_message_composer&userID=${user.id}`)}}
                    >
                        <img src='/svg/message_color.svg' />
                            Message
                    </button>}
                </div>
                <div className='thread-type-switch'>
                    <button
                        className={classNames('button-no-style', {'thread-active': !showPhotos})}
                        onClick={this.showOffers}
                    >Chat Offers</button>
                    <span>/</span>
                    <button
                        className={classNames('button-no-style', {'thread-active': showPhotos})}
                        onClick={this.showPhotos}
                    >Photos</button>
                </div>
                <div className='thread-area'>
                    { user.offer_thread_id && !showPhotos &&
                        <ChatOfferThread
                            threadID={user.offer_thread_id}
                            loadMethod={this.chatOfferLoad}
                            placeholder={OFFER_PLACEHOLDER}
                        />
                    }
                    { user.photo_thread_id && showPhotos &&
                        <PhotoThread
                            threadID={user.photo_thread_id}
                            loadMethod={this.photosLoad}
                            placeholder={PHOTO_PLACEHOLDER}
                        />
                    }
                </div>
            </div>

        )
    }

}

function mapStateToProps({users}, {params}) {

    return {
        user: users[params.userID]
    };
  }
  
  function mapDispatchToProps(dispatch) {

      return {
          actions: bindActionCreators(Actions, dispatch)
      };

  }

export default connect(mapStateToProps, mapDispatchToProps)(UserPage);  


class UserAbout extends Component {
    
    constructor() {
        super();
        this.state = {opened: false}
    }

    toggleOpened = () => this.setState({opened: !this.state.opened})

    render() {
        const {text} = this.props;
        if (!text) return null;
        const {opened} = this.state;
        const aboutClass = opened ? 'about-opened' : 'about-short';
        return (
            <div className={`about ${aboutClass}`}>
                <button
                    className='about-toggle'
                    onClick={this.toggleOpened}
                >
                    <Glyphicon glyph={opened ? 'menu-up' : 'menu-down'} />
                </button>
                <p>
                    {text}
                </p>
            </div>  
        );
    }
}

export function UserAvatar({thumbnail, avatarID}) {

    return (
        <div className='avatar'>
            <img src={thumbnail ? `/img/${thumbnail}` : '/svg/user.svg'} />
        </div>
    );

    // return (
    //     <Link className='link-no-style avatar'>
    //         <img src={`/img/${thumbnail || 'avatar-dummy.jpg'}`} />
    //     </Link>
    // );
}

export function UserOptions({isMyPage}) {
    // user browserHistory.push instead Link to avoid error: "cannot appear as a descendant..."
    let items = [];
    if (isMyPage) {
        items.push(
            <MenuItem key='edit_page'onClick={() => browserHistory.push('/edit_user')}>
                Edit my info
            </MenuItem>
        );
        items.push(
            <MenuItem key='settings' onClick={() => browserHistory.push('/settings')}>
                    Settings
            </MenuItem>
        );
        items.push(
            <MenuItem key='logout' onClick={() => browserHistory.push('/logout')}>
            Logout</MenuItem>
        );
    }
    return (
        <div className='user-option'>
            <DropdownTools className='button-no-style'>
                {items}
            </DropdownTools>
        </div>
    );
}