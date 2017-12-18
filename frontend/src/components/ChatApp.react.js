import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import SideBarWrapper, {SideBarButton} from './SideBar';
import { Modal, Grid, Row, Col, Glyphicon, Button } from 'react-bootstrap';
import classNames from 'classnames';
import { Scrollbars } from 'react-custom-scrollbars';
import { browserHistory, hashHistory } from 'react-router';
import {NewPostPhotoModal, PrivateMessageModal, NewOfferModal} from './modals';
import PostModal from './modals/post-modal';
import {PhotoSwipeDummy} from './PhotoSwipe';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Actions from '../actions';

import {Link} from 'react-router';

import Notifications from 'react-notification-system-redux';

import { closeModal, showModal } from '../utils';
import currentUserId, {loginRequired} from '../auth';

import {UpArrow, AddColorIcon, LoaderIcon} from './Icons';

import 'react-select/dist/react-select.css';


function scrollTo(element, to, duration) {
    var start = element.scrollTop,
        change = to - start,
        currentTime = 0,
        increment = 20;
        
    var animateScroll = function(){        
        currentTime += increment;
        var val = Math.easeInOutQuad(currentTime, start, change, duration);
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
Math.easeInOutQuad = function (t, b, c, d) {
  t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

function getScrolledBody() {
    if (document.body.scrollTop) {
        return document.body;
    }
    else if (document.documentElement.scrollTop) {
        return document.documentElement;
    }
}

class ChatApp extends Component { 

  render() {
    const { store, actions } = this.props;
    return (
        <div style={{height: '100%'}}>
            <PhotoSwipeDummy />
            <div className='fixed-buttons-area'>
                <ScrollBodyUpButton />
                <NewOfferButton />
            </div>
            <Notifications notifications={store.notifications}/>
            {this.props.children}
            <Modals {...this.props} />
        </div>
    )
  }
};


const NewOfferButton = loginRequired(() => {
    return (
        <button
            onClick={() => showModal('modalType=new_chat_offer')}
            className='button-no-style new-offer-button'
        >
            <AddColorIcon />
        </button>
    );
});


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
            
        let animateScroll = function(){        
            currentTime += increment;
            var val = Math.easeInOutQuad(currentTime, start, change, duration);
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
        scrollTo(
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


class Modals extends Component {

    render() {
        const {store, actions, location} = this.props;
        const {modalType} = location.query;
        switch (modalType) {

            case 'chat_offer': {
                const {postID} = location.query;
                return (
                    <PostModal
                        show={true}
                        postID={Number(postID)}
                        animation={true}
                        onHide={closeModal}
                        PostComponent={'PostChatOfferModal'}
                    />
                );
            }

            case 'private_message_composer': {
                const {userID} = location.query;
                return <PrivateMessageModal
                    userID={userID}
                    {...this.props}
                />
            }

            case 'new_chat_offer': {
                const user = store.users[currentUserId()];
                if (!user || !user.offer_thread_id) return null;
                return (
                    <NewOfferModal
                        show={true}
                        onHide={closeModal}
                        animation={true}
                        threadID={user.offer_thread_id}
                    />
                );
            }

            case 'new_photo': {
                const {avatar} = location.query;
                const user = store.users[currentUserId()];
                if (!user || !user.offer_thread_id) return null;
                return (
                    <NewPostPhotoModal
                        show={true}
                        onHide={closeModal}
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

function mapStateToProps(state) {
  return {store: state}
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(Actions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatApp);