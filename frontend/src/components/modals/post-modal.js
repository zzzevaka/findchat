import React, {Component} from 'react';
import {connect} from 'react-redux';
import { createSelector } from 'reselect';
import {Modal} from 'react-bootstrap';
import {OfferPost} from '../thread/offer-thread';
import {getPost, answerChatOffer} from '../../actions';
import PostComposer from '../PostComposer';
import './post-modal.css';

class PostModal extends Component {
    
    onSubmit = (p) => {
        const {dispatch, postID, onHide} = this.props;
        dispatch(answerChatOffer(postID, p));
        onHide();
    }

    componentDidMount() {
        const {post, postID, dispatch} = this.props;
        if (!post) dispatch(getPost(postID));
    }

    render() {
        const {post, postID, PostComponent, dispatch, ...rest} = this.props;
        if (!post) return null;
        return (
            <Modal className='modal-post' {...rest}>
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>
                    <div className='post-area'>
                        <OfferPost
                            post={post}
                            author={post.author}
                            dispatch={dispatch}
                        />
                    </div>
                    <PostComposer
                        onSubmit={this.onSubmit}
                        placeholder='Your answer'
                    />
                </Modal.Body>
            </Modal>
        );
    }

}


const postSelector = createSelector(
    [
        (state, post) => state.posts[post.id],
        (state, post) => state.users[post.author_id],
        (state, post) => state.threads[post.thread_id],
        (state, post) => state.postLikes[post.id],
    ],
    (post, user, thread, likes) => ({
        ...post,
        author: user,
        thread: thread,
        likes: likes
    })
);

function mapStateToProps(state, props) {
    const p = state.posts[props.postID];
    if (!p) return {};
    return {
        post: p ? postSelector(state, p) : {},
        dispatch: state.dispatch
    }
}

export default connect(mapStateToProps)(PostModal);