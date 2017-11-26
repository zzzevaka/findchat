#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import logging
import json
import tornado.web

from sqlalchemy import desc, func
from sqlalchemy.orm import contains_eager

from ..models.user import DEFAULT_USER_ID
from ..models.post import Post
from ..models.thread import User2Thread
from ..models.post_like import PostLike

from ..base_handler import BaseHandler


class PostLikeMixin(object):

    def _get_post(self, post_id):
        '''
            get post + user2thread by post_id
        '''
        return self.db.query(Post).\
            join(
                User2Thread, Post.thread_id == User2Thread.thread_id
            ).filter(
                Post.id == post_id
            ).filter(
                User2Thread.user_id.in_([DEFAULT_USER_ID, self.current_user])
            ).filter(
                User2Thread.is_current()
            ).order_by(
                desc(User2Thread.user_id)
            ).first()


    def _get_like_instance(self, post_id):
        return self.db.query(PostLike).filter(
                PostLike.post_id == post_id
            ).filter(
                PostLike.author_id == self.current_user
            ).first()
    
    def _get_count(self, posts_id):
        likes_count = self.db.query(
            PostLike.post_id,
            func.count(PostLike.post_id)
            ).filter(
                PostLike.post_id.in_(posts_id)
            ).filter(
                PostLike.recall == False
            ).group_by(
                PostLike.post_id
            ).all()
        return {i: c for i,c in likes_count}

    def _get_user_liked(self, posts_id, user_id):
        user_liked = self.db.query(
                PostLike.post_id
            ).filter(
                PostLike.post_id.in_(posts_id)
            ).filter(
                PostLike.author_id == self.current_user
            ).filter(
                PostLike.recall == False
            ).all()
        user_liked = [p[0] for p in user_liked]
        return {id: True for id in user_liked}
        
        

    def _get_brief(self, posts_id, user_id):
        '''
            doesn't load users_id. only count + current_liked
        '''
        counts = self._get_count(posts_id)
        user_liked = self._get_user_liked(posts_id, user_id)
        for_export = {
            
        }
        return {
            id: dict(
                count=cnt,
                current_liked=id in user_liked,
                users_id=[]
            ) for id, cnt in counts.items()
        }




class API_PostLike(BaseHandler, PostLikeMixin):

    def get(self, post_id):
        '''
            get array of user's id who did like the post

            example:
                GET /post_like/post_id

            returns array with user's id
        '''
        try:
            likers = self.db.query(PostLike.author_id).filter(
                    PostLike.post_id == post_id
                ).filter(
                    PostLike.recall == False
                ).all()
            if not likers:
                self.set_status(404)
                self.finish()
                return
            likers = [l[0] for l in likers]
            for_export = {}
            for_export['post_likes'] = {
                post_id: {
                    'users_id': likers,
                    'count': len(likers),
                    'current_liked': True if self.current_user in likers else False
                }
            }


            self.finish(json.dumps(for_export))
        except:
            logging.error('', exc_info=True)


    def post(self, post_id):
        '''
            add like to a post

            example:
                POST /post_like/post_id

            returns:
                200 - the comment created
                406 - incorrect data
                500 -internal error
        '''
        try:
            # get post + user2thread
            post = self._get_post(post_id)
            # post not found
            # it means that post doens't exist or current_user doesn't have
            # permissions for any actions
            if not post:
                self.set_status(406)
                self.finish()
                return
            # has current_user liked thip post early?
            like = self._get_like_instance(post_id)

            if like:
                # user has recalled the like.
                if like.recall:
                    like.recall = False
                # user is trying to like post repeatedly. It is forbidden
                else:
                    self.set_status(406)
                    self.finish()
                    return
            # the user has not liked this post early
            else:
                post.likes.append(PostLike(author_id=self.current_user))
            self.db.commit()
            self.finish(
                json.dumps({
                    'post_likes': self._get_brief([post_id,], self.current_user)
                })
            )
        except:
            logging.error('an error has occured', exc_info=True)
            raise tornado.web.HTTPError(500)


    def delete(self, post_id):
        '''
            recall like

            example:
                DELETE /post_like/post_id
        '''
        # get post + user2thread
        try:
            like = self._get_like_instance(post_id)
            # nothing to recall
            if not like or like.recall:
                self.set_status(406)
                return
            # recall
            else:
                like.recall = True
                post = self._get_post(post_id)
                post.likes_count -= 1
                self.db.commit()
            brief = self._get_brief([post_id,], self.current_user)
            if not brief:
                brief = {
                    post_id: {
                        'count': None, 'current_liked': False, 'users_id': []
                    }
                }
            self.finish(
                json.dumps({
                    'post_likes': brief
                })
            )
        except:
            logging.error('', exc_info=True)


class API_PostLikeBrief(BaseHandler, PostLikeMixin):

    def get(self):
        '''
            get array of user's id who did like the post

            example:
                GET /post_like/post_id

            returns array with user's id
        '''
        # get ids from arguments
        posts_id = self.get_argument('posts_id').split(',')
        # ids must be integers
        try:
            posts_id = [int(i) for i in posts_id]
        except ValuerError:
            raise tornado.web.HTTPError(406)
        try:
            self.finish(
                json.dumps({
                    'post_likes': self._get_brief(posts_id, self.current_user)
                })
            )
        except:
            raise


        
