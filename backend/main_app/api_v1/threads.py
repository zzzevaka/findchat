#!/usr/bin/env python3

import json
import logging
from datetime import datetime

import tornado.web

from sqlalchemy import and_, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import contains_eager, joinedload

from ..models.user import User, DEFAULT_USER_ID
from ..models.post import Post
from ..models.thread import PostThread, User2Thread, THREAD_TYPE, IgnoredPosts
from ..models.basemodel import alchemy_encoder

from ..base_handler import BaseHandler


class API_Threads(BaseHandler):
    
    def get(self):
        '''
            get threads with last posts by id
            
            example: GET /threads?id=1,2,3,4
                id: threads id list
            
            returns code and body:
                codes:
                    200 - normal
                    404 - nothing found
                    409 - incorrect arguments
                body (JSON):
                    {
                        threads: {
                            id: {
                                id: ...,
                                title: ...,
                                posts: [id of last_post],
                            }
                        },
                        posts: {
                            id: {
                                !!! post jsoined
                            }
                        }
                        
                    }
        '''
        # get ids from arguments
        threads_id = self.get_argument('id').split(',')
        # ids must be integers
        try:
            threads_id = [int(i) for i in threads_id]
        except ValuerError:
            raise tornado.web.HTTPError(409)
        result = self.db.query(PostThread, Post).\
            options(
                joinedload(Post.content)
            ).join(
                User2Thread, PostThread.id == User2Thread.thread_id
            ).outerjoin(
                    Post, User2Thread.last_post_id == Post.id
            ).filter(
                PostThread.id.in_(threads_id)
            ).filter(
                User2Thread.user_id.in_([self.current_user, DEFAULT_USER_ID])
            ).distinct(
            ).all()
        # returns 404 if there wasn't found any threads
        if not result:
            self.set_status(404)
            self.finish()
            return
        # prepare a returned body
        for_export = dict(
            threads={},
            posts={}
        )
        for row in result:
            thread,post = row
            thread = thread.export_dict
            if post:
                post = post.export_dict
                thread['posts'] = [post['id'],]
                for_export['posts'][post['id']] = post
            else:
                thread['posts'] = []
            for_export['threads'][thread['id']] = thread
        for_export = json.dumps(
            for_export,
            cls=alchemy_encoder(),
            check_circular=False,
        )
        self.finish(for_export)


class API_Chats(BaseHandler):

    @tornado.web.authenticated
    def get(self):
        # load only threads which id is less than less_id
        offset = self.get_argument('offset', None);
        # how many threads load
        limit = self.get_argument('limit', None)
        for_export = {
            'threads': {},
            'posts': {},
            'users': {}
        }
        users_to_load = [self.current_user, ]
        try:
            stmt = self.db.query(
                    User2Thread.id, func.max(Post.id).label('post_id')
                ).join(
                    PostThread, PostThread.id == User2Thread.thread_id
                ).join(
                    Post, User2Thread.thread_id == Post.thread_id
                ).outerjoin(
                    IgnoredPosts, and_(
                        User2Thread.id == IgnoredPosts.u2t_id,
                        Post.id == IgnoredPosts.post_id
                    )
                ).filter(
                    PostThread.type.in_([THREAD_TYPE['PRIVATE_CHAT']])
                ).filter(
                    User2Thread.user_id == self.current_user
                # ).filter(
                #     (User2Thread.thread_id < int(less_id)) if less_id else True
                ).filter(
                    IgnoredPosts.post_id == None
                ).group_by(
                    User2Thread.id
                ).limit(
                    limit
                ).offset(
                    offset
                ).subquery()
            query = self.db.query(
                User2Thread, Post
            ).options(
                joinedload(Post.content)
            ).join(
                stmt, and_(
                    User2Thread.id == stmt.c.u2t_id
                )
            ).join(
                Post, Post.id == stmt.c.post_id
            )
            result = query.all()
            for u2t, post in result:
                logging.debug(u2t.thread.id)
                thread = u2t.thread.export_dict
                thread['last_readed_post_id'] = u2t.last_readed_post_id
                thread['members'] = u2t.chat_members
                thread['posts'] = [post.id,]
                for_export['threads'][u2t.thread.id] = thread
                for_export['posts'][post.id] = post.export_dict
                users_to_load.extend(u2t.chat_members)
            result = self.db.query(User).filter(User.id.in_(users_to_load)).all()
            for u in result:
                for_export['users'][u.id] = u.export_dict
            for_export = json.dumps(
                for_export,
                cls=alchemy_encoder(),
                check_circular=False
            )
            self.finish(for_export)
        except tornado.web.HTTPError:
            raise
        except ValueError:
            raise tornado.web.HTTPError(406)
        except:
            raise
