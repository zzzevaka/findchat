import React from 'react';
import {Link, browserHistory} from 'react-router';
import classNames from 'classnames';

const EXCLUDE_SYMBOLS = '!@#\$%\^&\*\(\)\.,\?\+-=\/{}|\" ';
const HASHTAG_REGEX = new RegExp(`#([^${EXCLUDE_SYMBOLS}]+)`, 'gm');

function hashtagLink(tag) {
    return `/search/chat_offers?tags=${tag}`;
}

export function HashtagString(string, className) {
    return string.replace(
        HASHTAG_REGEX,
        (h,w) => `<a href="#" class="hashtag">${w}</a>`
    )
}

function callback(e) {
    var e = window.e || e;

    if (e.target.classList.contains('hashtag')) {
        e.preventDefault();
        browserHistory.push(`/search/chat_offers?tags=${e.target.innerHTML}`)
    }
    
}

if (document.addEventListener)
    document.addEventListener('click', callback, false);
else
    document.attachEvent('onclick', callback);