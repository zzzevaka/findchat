import React, {Component} from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import {Route} from 'react-router-dom';
import classNames from 'classnames';
import MainMenu from '../Menu';
import ThreadList from './thread-list';
import ChatPostList from './post-list';


import './chat-page.css';


export default class ChatPage extends Component {

    onResize = () => {
        this.forceUpdate();
    }

    componentDidMount() {
        window.addEventListener('resize', this.onResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize);
    }

    render() {
        const showChatList = this.props.location.pathname.search('/chats/?$') !== -1;
        const gridClasses = classNames(
            'chat-page-grid',
            'main-container',
            {'show-chat-list': showChatList}
        );
        return (
            <div
                className='chat-page'
                style={{height: window.innerHeight}}
            >
            <Grid fluid className={gridClasses}>
                <Row>
                    <Col sm={2}className='col-menu'>
                        <MainMenu />
                    </Col>
                    <Col sm={4} className='col-chat-list'>
                        <ThreadList />
                    </Col>
                    <Col sm={6} md={5} className='col-post-list'>
                        <Route
                            path="/chats/:threadID?"
                            component={ChatPostList}
                        />
                    </Col>
                </Row>
            </Grid>
            </div>
        );

    }

}