// This file bootstraps the entire application.

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import ChatApp from './components/ChatApp.react';
import UserPage from './components/UserPage';
import ChatPage from './components/ChatPage';
import SearchPage from './components/SearchPage';
import EditUserPage from './components/EditUserPage';
import LoginPage from './components/LoginPage';
import FollowPage from './components/FollowPage';
import NewsPage from './components/NewsPage';
import * as Actions from './actions';
import configureStore from './store/configureStore';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import ScrollMemory from 'react-router-scroll-memory';
import AuthProvider, {withAuth} from './auth';


import wsUpdater from './wsUpdater';

import './index.css';


import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';


const store = configureStore(window.__INITIAL_STATE__);


let IndexRedirect = function({auth}) {
    if (auth.authenticated === undefined) return null;
    return (
        <Redirect to={auth.user_id ? `/user/${auth.user_id}` : '/login'}
        />
    );
}

IndexRedirect = withAuth(IndexRedirect);

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
        path: '/edit_user',
        component: EditUserPage
    },
    {
        path: '/login',
        component: LoginPage
    },
];

ReactDOM.render(
  <Provider store={store}>
    <I18nextProvider i18n={i18n}>
        <AuthProvider>
            <BrowserRouter>
                <ChatApp>
                    <Route
                        exact path='/'
                        component={IndexRedirect}
                    />
                    <ScrollMemory compareOnlyPathname />
                    <Switch>
                        {routes.map(route => <Route key={route.path} {...route} />)}
                    </Switch>
                </ChatApp>
            </BrowserRouter>
        </AuthProvider>
    </I18nextProvider>
  </Provider>,
  document.getElementById('root')
);

// let ws = new wsUpdater();

// ws.open(`wss://${window.location.host}/ws`);

// ws.onmessage = (event) => {
//     const obj = JSON.parse(event.data)
//     if (obj.threads) {
//         store.dispatch(Actions.loadThreadSuccess(
//             obj.threads,
//             obj.posts,
//             {},
//         ));
//     }
//     if (obj.users) {
//         store.dispatch(Actions.loadUsersSuccess(obj.users));
//     }
//     if (obj.unreaded_posts) {
//         store.dispatch(Actions.updateUnreadedPostsAddToThread(
//             obj.unreaded_posts.thread_id,
//             obj.unreaded_posts.count
//         ));
//     }
// }
