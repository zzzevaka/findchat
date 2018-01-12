import React from 'react';
import classNames from 'classnames';

import './top-fixed-bar.css';


export function TopFixedBarDummy({className, ...rest}) {
    return (
        <div
            className={classNames('top-fixed-bar', className)}
            {...rest}
        />
    );
}

export function TopFixedBarDefault(props) {
    return (
        <TopFixedBarDummy>
            <div className='company-title'>
                <img src='/svg/logo_color.svg' className='logo' alt='logo' />
                <img src='/svg/findchat.svg' className='logo-name' alt='sitename' />
            </div>
        </TopFixedBarDummy>
    );
}