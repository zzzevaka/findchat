import React, {Component} from 'react';
import PageDummy from '../RegularPage';
import {NewsThread} from '../thread';
import {loadThread} from '../../actions';


const NEWS_PLACEHOLDER = 'There are no news';

export default function NewsPage(props) {

    const loadNews = (limit, offset, dispatch) => {
        dispatch(
            loadThread('news', limit, offset)
        );
    }

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