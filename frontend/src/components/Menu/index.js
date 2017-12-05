import React from 'react';
import { connect } from 'react-redux';
import {Link} from 'react-router';
import classNames from 'classnames';
import {ProfileIcon, MessageIcon, SearchIcon, SettingsIcon, AddColorIcon} from '../Icons';
import currentUserId, {loginRequired} from '../../auth';
import {getModalUrl} from '../../utils';
import './menu.css';

function MenuLink({children, className, ...rest}) {
    const classes = classNames(
        'menu-link',
        'link-no-style',
        className
    );
    return (
        <Link className={classes} activeClassName='menu-link-active' {...rest}>
            {children}
        </Link>
    )
}

let Menu = function({unreadedPosts}) {

    return (
        <ul className='main-menu'>
            <li>
                <MenuLink to={`/user/${currentUserId()}`}>
                    <ProfileIcon />
                    My profile
                </MenuLink>
            </li>
            <li>
                <MenuLink to='/chats'>
                    <MessageIcon />
                    Messages
                    {   
                        Boolean(unreadedPosts) && 
                            <span className='unreaded-posts'>{unreadedPosts}</span>
                    }
                </MenuLink>
            </li>
            <li>
                <MenuLink to='/search/chat_offers'>
                    <SearchIcon />
                    Searching
                </MenuLink>
            </li>
        </ul>
    );
}

let MobileMenu = function({unreadedPosts}) {
    return (
        <div className='mobile-main-menu'>
            <MenuLink to={`/user/${currentUserId()}`}
            >
                <ProfileIcon />
            </MenuLink>
            <MenuLink to='/chats'>
                <MessageIcon />
                {   
                    Boolean(unreadedPosts) && 
                        <span className='unreaded-posts'>{unreadedPosts}</span>
                }
            </MenuLink>
            <MenuLink
                to={getModalUrl('modalType=new_chat_offer')}
                className='link-new-offer'
            >
                <AddColorIcon />
            </MenuLink>
            <MenuLink to='/search/chat_offers'>
                <SearchIcon />
            </MenuLink>
            <MenuLink to='/settings'>
                <SettingsIcon />
            </MenuLink>
        </div>
    )
};

let NotLoginMenu = function() {
    return (
        <div className='footer gradient'>
        <MenuLink to={'/login'}>
            Sign In / Sign Up
        </MenuLink>
        </div>
    )
}


function mapStateToProps(state) {
    return {
        unreadedPosts: state.unreadedPosts.sum
    };
}

// loginRequired
Menu = loginRequired(Menu);
MobileMenu = loginRequired(MobileMenu, NotLoginMenu);

// connect to store
Menu = connect(mapStateToProps)(Menu);
MobileMenu = connect(mapStateToProps)(MobileMenu);

export {MobileMenu};
export default Menu;