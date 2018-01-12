import React, {Component} from 'react';
import connectThread, {mapStateToProps} from './connect-thread';
import {ThreadLoaderIcon, ThreadPlaceholder, InfiniteThread} from './thread-interface';
import {OfferPost, OfferPostWrapper} from './offer-thread';


class NewsThread extends Component {
    
    render() {
        const {thread, showPosts, placeholder, history, dispatch} = this.props;
        return (
            <div className='news-thread'>
                <InfiniteThread {...this.props} />
                {
                    thread.posts.slice(0, showPosts).map(p => <NewsPost {...p} key={p.post.id} dispatch={dispatch} history={history} />)
                }
                <ThreadLoaderIcon thread={thread} />
                <ThreadPlaceholder thread={thread} placeholder={placeholder} />
            </div>
        );

    }

}


export function NewsPost(props) {
    const {post} = props;
    switch (post.thread_type) {

        case 1:
            return (
                <OfferPost
                    {...props}
                />
            );

        case 2:
            return <p>2</p>

        case 5:
            return (
                <OfferPostWrapper
                    {...props}
                />
            )
        
        default:
            return null;

    }
}


export default connectThread(mapStateToProps)(NewsThread);