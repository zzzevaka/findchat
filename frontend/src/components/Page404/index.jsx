import React from 'react';
import { translate}  from 'react-i18next';
import RegularPage from '../RegularPage/index';
import './Page404.css';


function Index({ t }) {
    return (
        <RegularPage>
            <div className="page-404">
                <div className="page-404__text">
                    { t('Ooops! This page does not exist') }.
                </div>
            </div>
        </RegularPage>
    );
}

export default translate('translations')(Index);
