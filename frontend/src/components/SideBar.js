import React, { Component } from 'react';
import {Grid, Row, Col, Glyphicon, Badge} from 'react-bootstrap';
import classNames from 'classnames';
import { Link } from 'react-router';
import currentUserId from '../auth';

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';


const MIN_WIDTH_DEFAULT_OPEN = 768;

/*export class SideBarButton extends Component {
  render() {
    return (
      <Glyphicon
        glyph='menu-hamburger'
        className="sidebar-toggle-button"
        onClick={this.props.actions.toggleSideBar}
      />
    )
  }*/
  
export const SideBarButton = ({actions}) => {
  return (
    <Glyphicon
      glyph='menu-hamburger'
      className="sidebar-toggle-button"
      onClick={actions.toggleSideBar}
    />
  );
}


class NavLink extends Component {

  _onClick() {
    if (window.innerWidth <= MIN_WIDTH_DEFAULT_OPEN) {
      this.props.actions.toggleSideBar();
    }
  }

  render() {
    return <Link
      {...this.props}
      className="nav-link"
      activeClassName='active-link'
      onClick={this._onClick.bind(this)}
    />
  }

}

export default class SideBarWrapper extends Component {

  render() {
    const {store, actions} = this.props;
    return (
      <div id="wrapper" className={classNames({'open': store.sideBar.open})}>
        <div id='sidebar-wrapper'>
          <ul className="sidebar-nav">
            <li className='sidebar-item'>
              <NavLink to={`/user/${currentUserId()}`} actions={actions}>My Page</NavLink>
            </li>
            <li className='sidebar-item' style1={{display: 'flex', border: '1px solid black'}}>
                <NavLink to='/chats' actions={actions}>Chats</NavLink>
                {
                  store.unreadedPosts.sum != 0 && <Badge style={{margin: 'auto 6px', backgroundColor: '#507299'}}>
                  {store.unreadedPosts.sum}</Badge>
                }
            </li>
            <li className='sidebar-item'>
              <NavLink to='/search/chat_offers' actions={actions}>Searching</NavLink>
            </li>
            <li className='sidebar-item'>
              <NavLink to='/settings' actions={actions}>Settings</NavLink>
            </li>
          </ul>
        </div>
        <ReactCSSTransitionGroup
          transitionName='main-page'
          transitionEnter={false}
          transitionLeave={false}
          transitionAppear={true}
          transitionAppearTimeout={1500}
          id='page-content-wrapper'
          component='div'
        >
          <Grid fluid style={{padding: 0}}>
            <Row>
              <Col md={10} key='main-page'>
                {this.props.children}
              </Col>
              <Col md={2}>
              </Col>
            </Row>
          </Grid>
        </ReactCSSTransitionGroup>
      </div>
    )
  }
}