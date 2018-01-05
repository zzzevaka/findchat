import React, {Component} from 'react';
import {LoaderIcon} from '../Icons';
import InfiniteScroll from '../infinite-scroll';


export function ThreadLoaderIcon({thread}) {
    return (
        thread && thread.status === 'loading'
            ? <div
                style={{
                    textAlign: 'center',
                    padding: '10px'
                }}
             />
             : null
    );
}


export function ThreadPlaceholder({thread, placeholder}) {
    return (
        thread && thread.status === 'loaded' && !thread.posts.length
            ? <p className='thread-placeholder'>
                {placeholder}
            </p>
            : null
    );
}

export class InfiniteThread extends Component {

    _loadMethod = () => {
        const {thread, showMorePosts} = this.props;
        if (thread.status !== 'loading') showMorePosts();
    }

    render() {
        return <InfiniteScroll loadMethod={this._loadMethod} {...this.props} />
    }

}