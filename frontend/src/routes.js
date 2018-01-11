import React from 'react';

import ChatApp from './components/ChatApp.react';
import UserPage from './components/UserPage';
import ChatPage from './components/ChatPage';
import ChatPostList from './components/ChatPage/post-list';
import SearchPage from './components/SearchPage';
import SearchChatOffers from './components/SearchPage/SearchChatOffers';
import SearchPeople from './components/SearchPage/SearchPeople';
import SettingsPage from './components/SettingsPage';
import EditUserPage from './components/EditUserPage';
import LoginPage from './components/LoginPage';
import FollowPage from './components/FollowPage';
import NewsPage from './components/NewsPage';

export const routes = [
    {
        path: '/user/:userID/follow',
        component: FollowPage   
    },
    {
        path: '/user/:userID',
        component: UserPage
    },
    {
        path: '/search',
        component: SearchPage
    },
    {
        path: '/news',
        component: NewsPage
    },
    {
        path: '/chats',
        component: ChatPage
    },
    {
        path: '/settings',
        component: SettingsPage
    },
    {
        path: '/edit_user',
        component: EditUserPage
    },
    {
        path: '/login',
        component: LoginPage
    },
];