import React, {Component} from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import {NavLink, Route, Redirect} from 'react-router-dom';
import { translate } from 'react-i18next';
import SearchFiler from './search-filter';
import MainMenu from '../Menu';
import {TopFixedBarDummy} from '../TopFixedBar';
import './search-page.css';

import SearchChatOffers from './SearchChatOffers';
import SearchPeople from './SearchPeople';


class SearchPage extends Component {

    render() {
        const {match, t} = this.props;
        return (
            <div className='search-page'>
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
                                    {t("Topics")}
                                </NavLink>
                                <span>/</span>
                                <NavLink
                                    to='/search/people'
                                    className='link-no-style'
                                    activeClassName='link-active'
                                >
                                    {t("People")}
                                </NavLink>
                            </div>
                            <Route
                                exact path={match.url}
                                render={() => <Redirect to={`${match.url}/chat_offers`} />}
                            />
                            <Route path={`${match.url}/chat_offers`} component={SearchChatOffers} />
                            <Route path={`${match.url}/people`} component={SearchPeople} />
                        </Col>
                    </Row>
                </Grid>
            </div>
        );

    }
}

export default translate('translations')(SearchPage);

export function SearchFilterTopFixedBar(props) {
    return (
        <TopFixedBarDummy className='search-page-top-fixed-bar'>
            <SearchFiler {...props} />
        </TopFixedBarDummy>
    );
}