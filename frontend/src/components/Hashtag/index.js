import React from 'react';
import {Link, browserHistory} from 'react-router';
import classNames from 'classnames';

function hashtagLink(tag) {
    return `/search/chat_offers?tags=${tag}`;
}

export function HashtagString(string, className) {
    return string.replace(
        /#(\w+)/gm,
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