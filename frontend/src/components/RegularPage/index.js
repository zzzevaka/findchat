import React, {Component} from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import MainMenu, {MobileMenu} from '../Menu';

import './regular-page.css';


export default function RegularPage(props) {
    return (
        <div className='regular-page'>
            <RegularPage.Grid>
                {props.children}
            </RegularPage.Grid>
        </div>
    );
}

RegularPage.Grid = function(props) {
    return (
        <Grid fluid className='regular-page-grid main-container'>
            <Row>
                <RegularPage.MenuCol />
                <RegularPage.MainCol>
                    {props.children}
                </RegularPage.MainCol>
            </Row>
        </Grid>
    );
}

RegularPage.MenuCol = function(props) {
    return (
        <Col sm={2} className='col-menu'>
            <MainMenu />
            <MobileMenu />
        </Col>
    );
}

RegularPage.MainCol = function(props) {
    return (
        <Col sm={8} className='main-col'>
            {props.children}
        </Col>
    );
}