import React from 'react';
import { connect } from 'react-redux';
import {Link, NavLink, withRouter} from 'react-router-dom';
import classNames from 'classnames';
import {ProfileIcon, MessageIcon, SearchIcon, SettingsIcon, AddColorIcon, LikeIcon} from '../Icons';
import currentUserId, {loginRequired} from '../../auth';
// import {getModalUrl} from '../../utils';
import './menu.css';

function MenuLink({children, className, ...rest}) {
    const classes = classNames(
        'menu-link',
        'link-no-style',
        className
    );
    return (
        <NavLink className={classes} activeClassName='menu-link-active' {...rest}>
            {children}
        </NavLink>
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
                <MenuLink to='/search'>
                    <SearchIcon />
                    Searching
                </MenuLink>
            </li>
            <li>
                <MenuLink to='/news'>
                    <LikeIcon />
                    News
                </MenuLink>
            </li>
        </ul>
    );
}

let MobileMenu = function({unreadedPosts, history}) {
    return (
        <div className='mobile-main-menu'>
            <MenuLink to={`/user/${currentUserId()}`}>
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
                to={history.location.pathname + '?modalType=new_chat_offer'}
                className='link-new-offer'
            >
                <AddColorIcon />
            </MenuLink>
            <MenuLink to='/search'>
                <SearchIcon />
            </MenuLink>
            <MenuLink to='/news'>
                <LikeIcon />
            </MenuLink>
        </div>
    )
};

let NotLoginMenu = function() {
    return (
        <div className='footer gradient'>
        <MenuLink to={'/login?showForm=1'}>
            Join
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

// connect to router
Menu = withRouter(Menu);
MobileMenu = withRouter(MobileMenu);


export {MobileMenu};
export default Menu;