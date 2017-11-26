import React from 'react';
import shortid from 'shortid';
import {DropdownButton, MenuItem, Glyphicon} from 'react-bootstrap';
import {deletePost, updateUser, revivePost} from '../../actions';

export function DropdownTools(props) {
    if (!props.children) return null;
    return (
        <DropdownButton
            id={`dworpdown_${shortid.generate()}`}
            noCaret
            className='button-no-style button-tools'
            pullRight
            title={<Glyphicon glyph='option-horizontal' />}
            {...props}
        />
    )
}

export function DeletePostMenuItem(post, dispatch) {
    return post.status === 'deleted'
        ? <MenuItem onClick={() => dispatch(revivePost(post.id))}>Revive</MenuItem>
        : <MenuItem onClick={() => dispatch(deletePost(post.id))}>Delete</MenuItem>
}

export function SetAsAvatarMenuItem(post, dispatch) {
    return (
        <MenuItem
            onClick={() => dispatch(updateUser({avatar_id: post.id}))}
        >
            Set as avatar
        </MenuItem>
    );
}