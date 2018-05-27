import React from 'react';
import { translate}  from 'react-i18next';
import PageDummy from '../RegularPage';
import { TopFixedBarDummy } from '../TopFixedBar';
import { NewsThread } from '../thread';
import { loadThread } from '../../actions';


const NEWS_PLACEHOLDER = 'There are no news';

export default function NewsPage(props) {

    const loadNews = (limit, offset, dispatch) => {
        dispatch(
            loadThread('news', limit, offset)
        );
    };

    return (
        <PageDummy>
            <NewsThread
                threadID='news'
                placeholder={NEWS_PLACEHOLDER}
                loadMethod={loadNews}
            />
        </PageDummy>
    );
}


let NewsTopFixedBar = function({t}) {
    return (
        <TopFixedBarDummy>
            <div style={{
                display: 'flex',
                width: '100%',
                height: '100%',
            }}>
                <p style={ { margin: 'auto' } }>{ t('News') }</p>
            </div>
        </TopFixedBarDummy>
    );
}

NewsTopFixedBar = translate("translations")(NewsTopFixedBar);

export { NewsTopFixedBar };
