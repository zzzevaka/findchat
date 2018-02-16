import React, {PureComponent} from 'react';
import classNames from 'classnames';
import {DropdownButton, MenuItem} from 'react-bootstrap';

import './top-fixed-bar.css';

import {translate, I18n} from 'react-i18next';
// import i18n from 'i18next';


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
            {props.children}
        </TopFixedBarDummy>
    );
}

export function TopFixedBarDefaultWithLang(props) {
    return (
        <TopFixedBarDefault>
            <div style={{
                height: '100%',
                display: 'flex',
                position: 'absolute',
                right: 0
            }}>
            <div style={{
                margin: 'auto 15px'
            }}>
            <ChangeLang />
            </div>
            </div>
        </TopFixedBarDefault>
    );
}

class ChangeLang extends PureComponent {

    lang = [
        ['en', 'English'],
        ['ru', 'Русский'],
    ]

    onClick = lang => {
        this.props.i18n.changeLanguage(lang);
        this.forceUpdate();
    }

    render() {
        return (
            <DropdownButton
                id='change-lang'
                pullRight
                noCaret
                title={this.props.i18n.language}
            >
            {
                this.lang.map(
                    l => <MenuItem
                            key={l[0]}
                            eventKey={l[0]}
                            onSelect={this.onClick}>
                                {l[1]}
                        </MenuItem>
                )
            }
            </DropdownButton>
        )
    }
}

ChangeLang = translate('translations')(ChangeLang)

export {ChangeLang};