import React, {Component} from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import classNames from 'classnames';
import {Link} from 'react-router';
import Select, {Creatable} from 'react-select';
import SearchFiler from './search-filter';
import MainMenu, {MobileMenu} from '../Menu';
import getCurrentUser from '../../auth';
import './search-page.css';

export default class SearchPage extends Component {

    render() {

        console.log(
            'url',
            this.props.params
        )

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
                                <Link
                                    to='/search/chat_offers'
                                    className='link-no-style'
                                    activeClassName='link-active'
                                >
                                    Chat Offers
                                </Link>
                                <span>/</span>
                                <Link
                                    to='/search/people'
                                    className='link-no-style'
                                    activeClassName='link-active'
                                >
                                    People
                                </Link>
                            </div>
                            {this.props.children}
                        </Col>
                    </Row>
                </Grid>
            </div>
        );

    }
}