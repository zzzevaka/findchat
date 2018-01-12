import 'react-select/dist/react-select.css';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import SideBarWrapper, {SideBarButton} from './SideBar';
import classNames from 'classnames';
import { Switch, Route, withRouter } from 'react-router-dom';
import {NewPostPhotoModal,
        PrivateMessageModal,
        NewOfferModal} from './modals';
import PostModal from './modals/post-modal';
import {PhotoSwipeDummy} from './PhotoSwipe';
import {MobileMenu} from './Menu';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Actions from '../actions';

import Notifications from 'react-notification-system-redux';

import { parseHistorySearch } from '../utils';
import {loginRequired} from '../auth';

import {UpArrow, AddColorIcon} from './Icons';
import {TopFixedBarDefault} from './TopFixedBar';
import {UserPageTopFixedBar} from './UserPage';
import {SearchFilterTopFixedBar} from './SearchPage';
import {ChatTopFixedBar} from './ChatPage/post-list';


class ChatApp extends Component { 

    _hashtagClicked = e => {
        if (e.target.classList.contains('hashtag')) {
            e.preventDefault();            
            const {history} = this.props;
            history.push(`/search/chat_offers?tags=${e.target.innerHTML}`)
        }
    }

    componentDidMount() {
        document.addEventListener('click', this._hashtagClicked, false);
    }

    render() {
        const {store} = this.props;
        return (
            <div style={{height: '100%'}}>
                <PhotoSwipeDummy />
                <div className='fixed-buttons-area'>
                    <ScrollBodyUpButton />
                    <NewOfferButton />
                </div>
                <Switch>
                    <Route path='/user/:userID/follow' component={UserPageTopFixedBar} />
                    <Route path='/chats/:threadID' component={ChatTopFixedBar} />
                    <Route path='/search' component={SearchFilterTopFixedBar} />
                    <Route path='/' component={TopFixedBarDefault} />
                </Switch>
                <Switch>
                    <Route path='/chats/:chatID' render={() => null} />
                    <Route path='/login' render={() => null} />
                    <Route path='/' component={MobileMenu} />
                </Switch>
                <Notifications notifications={store.notifications}/>
                {this.props.children}
                <Modals {...this.props} />
            </div>
        )
    }
};


let NewOfferButton = ({history}) => {
    return (
        <button
            onClick={() => history.push(history.location.pathname + '?modalType=new_chat_offer')}
            className='button-no-style new-offer-button'
        >
            <AddColorIcon />
        </button>
    );
};

NewOfferButton = loginRequired(NewOfferButton);
NewOfferButton = withRouter(NewOfferButton);



class ScrollBodyUpButton extends Component {

    static propTypes = {
        duration: PropTypes.number.isRequired,
        offsetShow: PropTypes.number.isRequired,
    }

    static defaultProps = {
        duration: 500,
        offsetShow: 200,
    }

    constructor() {
        super();
        this.state = { hidden: true };
    }

    componentDidMount() {
        window.addEventListener('scroll', this.onScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.onScroll);
    }

    scrollTo(element, to, duration) {
        let start = element.scrollTop,
            change = to - start,
            currentTime = 0,
            increment = 20;
            
        let animateScroll = () => {        
            currentTime += increment;
            var val = this.easeInOutQuad(currentTime, start, change, duration);
            element.scrollTop = val;
            if(currentTime < duration) {
                setTimeout(animateScroll, increment);
            }
        };
        animateScroll();
    }

    //t = current time
    //b = start value
    //c = change in value
    //d = duration
    easeInOutQuad(t, b, c, d) {
        t /= d/2;
        if (t < 1) return c/2*t*t + b;
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
    }

    onScroll = () => {
        const {hidden} = this.state;
        if (window.scrollY >= this.props.offsetShow) {
            if (hidden) {
                this.setState({
                    hidden: false,
                });
            }
        }
        else if (!hidden) {
            this.setState({
                hidden: true
            });
        }
    }

    onClick = e => {
        e.preventDefault();
        const el = document.documentElement.scrollTop
            ? document.documentElement
            : document.body;
        this.scrollTo(
            el,
            0,
            this.props.duration
        );
    }

    render() {
        const classes = classNames(
            'button-no-style',
            'button-scroll-body-up',
            {'button-scroll-body-up--hidden': this.state.hidden}
        );
        return (
            <button
                className={classes}
                onClick={this.onClick}
            >
                <UpArrow />
            </button>
        );
    }

}


let Modals  = class extends Component {

    closeModal = () => {
        const {history} = this.props;
        history.push(history.location.pathname);
    }

    pushHistory = (url) => this.props.history.push(url)

    onPrivateMessageSubmit = (userID, post) => {
        const {actions, history} = this.props;
        actions.sendPostToUser(userID, post).then(
            threadID => history.push(`/chats/${threadID}`)
        );
    }

    render() {
        const {store, actions, history} = this.props;
        const queryParams = parseHistorySearch(history);
        const {modalType} = queryParams;
        switch (modalType) {

            case 'chat_offer': {
                const {postID} = queryParams;
                return (
                    <PostModal
                        show={true}
                        postID={Number(postID)}
                        animation={true}
                        onHide={this.closeModal}
                        PostComponent={'PostChatOfferModal'}
                    />
                );
            }

            case 'private_message_composer': {
                const {userID} =queryParams;
                return <PrivateMessageModal
                    show={true}
                    userID={userID}
                    onSubmit={this.onPrivateMessageSubmit}
                    onHide={this.closeModal}
                />
            }

            case 'new_chat_offer': {
                const user = store.users[store.auth.user_id];
                if (!user || !user.offer_thread_id) return null;
                return (
                    <NewOfferModal
                        show={true}
                        onHide={this.closeModal}
                        animation={true}
                        threadID={user.offer_thread_id}
                    />
                );
            }

            case 'new_photo': {
                const {avatar} = queryParams;
                const user = store.users[store.auth.user_id];
                if (!user || !user.offer_thread_id) return null;
                return (
                    <NewPostPhotoModal
                        show={true}
                        onHide={
                            () => this.pushHistory(`/user/${store.auth.user_id}/photos`)
                        }
                        animation={true}
                        title='New Photo'
                        threadID={user.photo_thread_id}
                        cropRatio={avatar && 1}
                        submitAction={
                            avatar ? actions.addAvatarPost : actions.addPost
                        }
                        cropperClassName={avatar && 'avatar-cropper'}
                    />
                );
            }

            default: {
                return null;
            }
        }
    }

}

Modals = withRouter(Modals);

function mapStateToProps(state) {
  return {store: state}
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(Actions, dispatch)
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChatApp));