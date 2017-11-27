// This file bootstraps the entire application.

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import ChatApp, {ModalDummy} from './components/ChatApp.react';
// import UserPage from './components/UserPage.react';
import UserPage from './components/UserPage';
import ChatPage from './components/ChatPage';
import ChatPostList from './components/ChatPage/post-list';
import SearchingPage from './components/SearchPage';
import SearchChatOffers from './components/SearchPage/SearchChatOffers';
import SearchPeople from './components/SearchPage/SearchPeople';
import SettingsPage from './components/SettingsPage';
import EditUserPage from './components/EditUserPage';
import LoginPage from './components/LoginPage';
import * as Actions from './actions';
import configureStore from './store/configureStore';
import { Router, Route, IndexRedirect, browserHistory, hashHistory, applyRouterMiddleware } from 'react-router';
import { useScroll } from 'react-router-scroll';
import currentUserId from './auth';

import wsUpdater from './wsUpdater';

import './index.css';


const store = configureStore();

const scrollBehavior = useScroll((prevRouterProps, { location }) => (
  prevRouterProps && location.pathname !== prevRouterProps.location.pathname
));

ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory} render={applyRouterMiddleware(scrollBehavior)} >
        <Route path='/' component={ChatApp}>
            <IndexRedirect
                to={currentUserId() ? `user/${currentUserId()}` : 'login'}
            />
            <Route path='user/:userID' component={UserPage} /> 
            <Route path='search' component={SearchingPage}>
                <Route path="chat_offers" component={SearchChatOffers} />
                <Route path="people" component={SearchPeople} />
            </Route>
            <Route path='chats' component={ChatPage}>
                <Route path=":threadID" component={ChatPostList} onEnter={ChatPostList.onEnter}/>
            </Route>
            <Route path='settings' component={SettingsPage} />
            <Route path='edit_user' component={EditUserPage} />
        </Route>
        <Route path='login' component={LoginPage} />
    </Router>
  </Provider>,
  document.getElementById('root')
);


let ws = new wsUpdater();

ws.open(`ws://${window.location.host}/ws`);

ws.onmessage = (event) => {
    const obj = JSON.parse(event.data)
    if (obj.threads) {
        store.dispatch(Actions.loadThreadSuccess(
            obj.threads,
            obj.posts,
            {},
        ));
    }
    if (obj.users) {
        store.dispatch(Actions.loadUsersSuccess(obj.users));
    }
    if (obj.unreaded_posts) {
        store.dispatch(Actions.updateUnreadedPostsAddToThread(
            obj.unreaded_posts.thread_id,
            obj.unreaded_posts.count
        ));
    }
}

if (currentUserId) store.dispatch(Actions.loadUnreaded());

