// This file bootstraps the entire application.

import React from 'react';
import ReactDOM from 'react-dom';
import { CSSTransitionGroup } from 'react-transition-group';
import { Provider } from 'react-redux';
import ChatApp, {ModalDummy} from './components/ChatApp.react';
// import UserPage from './components/UserPage.react';
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
import * as Actions from './actions';
import configureStore from './store/configureStore';
import { BrowserRouter, withRouter, Route, Switch, Link, Redirect } from 'react-router-dom';
import ScrollMemory from './react-router-scroll-memory';
// import { useScroll } from 'react-router-scroll';
import currentUserId from './auth';


import wsUpdater from './wsUpdater';

import './index.css';


import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';


const store = configureStore(window.__INITIAL_STATE__);


const IndexRedirect = () => {
    return (
        <Redirect to={currentUserId() ? `/user/${currentUserId()}` : '/login'}
        />
    );
}

// ScrollMemory.componentWillReceiveProps = () => {
//     alert('next');
// }

class Wrapp extends React.Component {

    componentDidUpdate() {
        // this.scrollMemory && alert(this.scrollMemory.url)
        console.log(<ScrollMemory />)
    }

    render = () => null

}

ReactDOM.render(
  <Provider store={store}>
    <I18nextProvider i18n={i18n} >
    <BrowserRouter>
        <ChatApp>
            <Route
                exact path='/'
                component={IndexRedirect}
            />
            {true && <ScrollMemory compareOnlyPathname />}
            <Switch>
                <Route
                    path='/user/:userID/follow'
                    component={FollowPage}
                />
                <Route
                    path='/user/:userID'
                    component={UserPage}
                /> 
                <Route
                    path='/search'
                    component={SearchPage}
                />
                <Route
                    path='/news'
                    component={NewsPage}
                />
                <Route
                    path='/chats'
                    component={ChatPage}
                />
                <Route
                    path='/settings'
                    component={SettingsPage}
                />
                <Route
                    path='/edit_user'
                    component={EditUserPage}
                />
                <Route
                    path='/login'
                    component={LoginPage}
                />
            </Switch>
        </ChatApp>
    </BrowserRouter>
    </I18nextProvider>
  </Provider>,
  document.getElementById('root')
);

let ws = new wsUpdater();

ws.open(`wss://${window.location.host}/ws`);

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

