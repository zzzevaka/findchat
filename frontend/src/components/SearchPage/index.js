import React, {Component} from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import classNames from 'classnames';
import {NavLink, Route} from 'react-router-dom';
import Select, {Creatable} from 'react-select';
import SearchFiler from './search-filter';
import MainMenu, {MobileMenu} from '../Menu';
import getCurrentUser from '../../auth';
import './search-page.css';

import SearchChatOffers from './SearchChatOffers';
import SearchPeople from './SearchPeople';

export default class SearchPage extends Component {

    render() {
        const {match} = this.props;
        return (
            <div className='search-page'>
                <div className='top-fixed-bar'>
                   <SearchFiler {...this.props} />
                </div>
                <MobileMenu />
                <Grid fluid className='search-page-grid main-container'>
                    <Row>
                        <Col sm={2} className='col-menu'>
                            <MainMenu />
                        </Col>
                        <Col sm={8} className='col-search-result'>
                            
                            <div className='search-type-switch'>
                                <NavLink
                                    to='/search/chat_offers'
                                    className='link-no-style'
                                    activeClassName='link-active'
                                >
                                    Chat Offers
                                </NavLink>
                                <span>/</span>
                                <NavLink
                                    to='/search/people'
                                    className='link-no-style'
                                    activeClassName='link-active'
                                >
                                    People
                                </NavLink>
                            </div>
                            <Route path={`${match.url}/chat_offers`} component={SearchChatOffers} />
                            <Route path={`${match.url}/people`} component={SearchPeople} />
                        </Col>
                    </Row>
                </Grid>
            </div>
        );

    }
}

const TestRoute = () => <div>суки</div>;