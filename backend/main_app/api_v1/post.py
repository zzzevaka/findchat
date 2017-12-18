#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os.path
import json
import logging
from datetime import datetime

import tornado.web

from sqlalchemy import and_, or_, update, func
from sqlalchemy.orm import joinedload, contains_eager

from ..models.basemodel import STRFTIME_FORMAT, alchemy_encoder
from ..models.user import User, DEFAULT_USER_ID
from ..models.post import Post
from ..models.thread import PostThread, User2Thread, IgnoredPosts, THREAD_TYPE
from ..models.hashtag import Hashtag, HashTagInterface

from ..base_handler import BaseHandler

class API_Post(BaseHandler, HashTagInterface):
    
    def get(self, post_id):
        '''
            get post by id
            
            example: GET /post/123
            
            returns TODO
        '''
        try:
            for_export = {
                'threads': {},
                'posts': {},
                'users': {}
            }
            result = self.db.query(Post, User2Thread).\
                options(joinedload(Post.content)).\
                options(joinedload(Post._author)).\
                options(joinedload(Post._author)).\
                join(User2Thread, Post.thread_id == User2Thread.thread_id).\
                filter(Post.id == post_id).\
                filter(
                    or_(
                        User2Thread.user_id == self.current_user,
                        User2Thread.user_id == DEFAULT_USER_ID
                    )
                ).\
                filter(
                    and_(
                        Post._start_date >= User2Thread._start_date,
                        Post._start_date <= User2Thread._stop_date
                    )
                ).\
                filter(Post._stop_date >= datetime.now()).\
                first()
            # a post is found
            if result:
                post, u2t = result
                for_export['threads'][u2t.thread_id] = {
                    'id': u2t.thread_id,
                    'posts': [post.id,],
                    'allow_add_posts': u2t.allow_add_posts,
                    'allow_del_posts': u2t.allow_del_posts,
                    'allow_add_comments': u2t.allow_add_comments
                }
                for_export['posts'][post.id] = post.export_dict
                for_export['users'][post.author_id] = post._author.export_dict
                for_export = json.dumps(
                    for_export,
                    cls=alchemy_encoder(),
                    check_circular=False
                )
                self.finish(for_export)
            # a post isn't found
            else:
                self.set_status(404)
                self.finish()           
        except:
            logging.error('an error has occured', exc_info=True)
            raise tornado.web.HTTPError(500)
        

    def get_thread_with_u2t(self, thread_id):
        return self.db.query(PostThread).\
            join(
               User2Thread
            ).options(
                contains_eager(PostThread.user2thread)
            ).filter(
                PostThread.id == int(thread_id)
            ).filter(
                User2Thread.is_current()
            ).filter(
                User2Thread.allow_add_posts == True
            ).all()

    def post(self):
        '''
            new post
            
            example:
            POST /post
                body = post: '{...post jsoined}'
                
            returns only code:
                200 - the post created
                406 - incorrect data
                404 - thread not found
        '''
        try:
            post = None
            arg_post = self.get_argument('post')
            try:
                arg_post = json.loads(arg_post)
                if not Post.check_user_post(arg_post):
                    raise tornado.web.HTTPError(406)
                post = Post(author_id=self.current_user, **arg_post)
            except (KeyError, ValueError, json.decoder.JSONDecodeError):
                raise tornado.web.HTTPError(406)
            # logging.debug('post to thread %i !' % int(arg_post['thread_id']))
            # The empty reponse means what the thread doesn't exist
            # returns 404
            thread = self.get_thread_with_u2t(arg_post['thread_id'])
            if thread:
                thread = thread[0]
            else:
                raise tornado.web.HTTPError(404)
            # if current_user or default_user not found in user2thread
            cur_user_u2t = None
            for u2t in thread.user2thread:
                if self.current_user == u2t.user_id:
                    cur_user_u2t = u2t
                elif u2t.user_id == DEFAULT_USER_ID and not cur_user_u2t:
                    cur_user_u2t = u2t
            # if user2thread for current_user wasn't found or
            # user2thread.allow_add_posts is not True - raise 404
            if not cur_user_u2t or not cur_user_u2t.allow_add_posts is True:
                raise tornado.web.HTTPError(404)
            if (thread.type == THREAD_TYPE['PUBLIC'] or thread.type == THREAD_TYPE['CHAT_OFFER']):
                # add comment thread
                # post.add_comment_thread()
                post._comment_thread = PostThread(type=THREAD_TYPE['COMMENT'])
                for u2t in thread.user2thread:
                    post._comment_thread.user2thread.append(
                        User2Thread(
                            user_id=DEFAULT_USER_ID,
                            allow_del_posts=u2t.allow_del_posts
                        )
                    )
                # create hashtags
                for t in Hashtag.get_hashtags_from_string(post.text, self.db):
                    post.hashtags.append(t)
            self.db.add(post)
            for u2t in thread.user2thread:
                # u2t.last_post = post
                if u2t.user_id == self.current_user:
                    u2t.last_readed_post = post
            self.db.commit()
            # load content
            post.content
            # post._author
            for_export = dict(
                new_post_id=post.id,
                posts={post.id: post.export_dict},
                threads={
                    thread.id: {'posts': [post.id]}
                },
                users={
                    post.author_id: post._author.export_dict
                }
            )
            if (thread.type == THREAD_TYPE['PRIVATE_CHAT']):
                for_export['unreaded_posts'] = {
                    'thread_id': thread.id,
                    'count': 1
                }
            jsoined = json.dumps(
                for_export,
                cls=alchemy_encoder(),
                check_circular=False,
            )
            self.finish(jsoined)
            for u2t in thread.user2thread:
                if u2t.user_id == DEFAULT_USER_ID:
                    self.redis.publish('updates:thread:%s' % u2t.thread_id, jsoined)
                self.redis.publish('updates:user:%s' % u2t.user_id, jsoined)
        except tornado.web.HTTPError:
            raise
        except:
            logging.error(
                'fatal error:\n Request info:\n%s\narguments: %s\n' %\
                    (self.request, self.request.arguments),
                exc_info=True
            )
            raise tornado.web.HTTPError(500)
        
    def delete(self, post_id):
        '''
            add post_id to ignored (table ignored_posts) for ourself and PUBLIC

            Also post can be deleted by author
            
            !WARNING: a post will not be deleted. It just puts post_id to
                ignored_posts for user2thread of current_user and default_user.
                
            Users with another user2thread instances will can see this post
                
            example: DELETE /post/123
        '''
        try:
            ret_code = 404
            post = self.db.query(
                    Post
                ).join(
                    User2Thread, Post.thread_id == User2Thread.thread_id
                ).outerjoin(
                    IgnoredPosts, and_(
                        Post.id == IgnoredPosts.post_id,
                        User2Thread.id == IgnoredPosts.u2t_id
                    )
                ).options(
                    joinedload('thread'),
                    joinedload('thread.user2thread')
                ).filter(
                    Post.id == post_id
                ).filter(
                    IgnoredPosts.post_id == None
                ).all()
            
            if post:
                post = post[0]
            else:
                raise tornado.web.HTTPError(404)
            current_user_del_allow = False
            for u2t in post.thread.user2thread:
                if u2t.user_id == self.current_user and u2t.is_current() and u2t.allow_del_posts:
                    current_user_del_allow = True

            for u2t in post.thread.user2thread:
                allow_del = False
                if current_user_del_allow:
                    allow_del = True
                elif post.author_id == self.current_user and post.thread.type in (THREAD_TYPE['PUBLIC'], THREAD_TYPE['COMMENT']):
                    allow_del = True
                elif u2t.user_id == self.current_user:
                    allow_del = True
                if allow_del:
                    ret_code = 200
                    u2t.ignored_posts.append(
                        IgnoredPosts(post=post, del_user_id = self.current_user)
                    )
            self.db.commit()
            self.set_status(ret_code)
            self.finish()
        except tornado.web.HTTPError:
            raise
        except:
            logging.error(
                'fatal error:\n Request info:\n%s\narguments: %s\n' %\
                    (self.request, self.request.arguments),
                exc_info=True
            )
            raise tornado.web.HTTPError(500)

    def put(self, post_id):
        '''
            revive post
        '''
        try:
            post = self.db.query(
                    Post
                ).outerjoin(
                    IgnoredPosts
                ).options(
                    joinedload('thread'),
                    joinedload('thread.user2thread')
                ).filter(
                    Post.id == post_id
                ).filter(
                    IgnoredPosts.post_id != None
                ).all()[0]
            if not post:
                raise tornado.web.HTTPError(404)
            for i_p in post.ignored_posts:
                self.db.delete(i_p)
                # if i_p.del_user_id == self.current_user:
                #     self.db.delete(i_p)
            self.db.commit()
        except tornado.web.HTTPError:
            raise
        except:
            logging.error(
                'fatal error:\n Request info:\n%s\narguments: %s\n' %\
                    (self.request, self.request.arguments),
                exc_info=True
            )
            raise tornado.web.HTTPError(500)


class API_UnreadedPostCount(BaseHandler):
    
    @tornado.web.authenticated
    def get(self):
        '''
            get unreaded posts count.
            Output example:
             {
                 'unreaded_posts': {
                    'sum': 10,
                     'threads': {
                         1: 3,
                         2: 2,
                         5: 5
                     }
                 }
             }
        '''
        try:
            result = self.db.query(
                    PostThread.id, func.count(Post.id)
                ).join(
                    User2Thread, PostThread.id == User2Thread.thread_id
                ).join(
                    PostThread.posts
                ).outerjoin(
                    IgnoredPosts, and_(
                        User2Thread.id == IgnoredPosts.u2t_id,
                        Post.id == IgnoredPosts.post_id
                    )
                ).filter(
                    PostThread.type == THREAD_TYPE['PRIVATE_CHAT']
                ).filter(
                    User2Thread.user_id == self.current_user
                ).filter(
                    Post.id > User2Thread.last_readed_post_id
                ).filter(
                    and_(
                        Post._start_date >= User2Thread._start_date,
                        Post._start_date <= User2Thread._stop_date
                    )
                ).filter(
                    IgnoredPosts.post_id == None
                ).group_by(
                    PostThread.id
                ).all()
            logging.debug(result)
            for_export = {
                'sum': 0,
                'threads': {}
            }
            for k,v in result:
                for_export['threads'][k] = v
                for_export['sum'] += v
            self.finish(json.dumps({'unreaded_posts': for_export}))
        except:
            logging.error(
                'fatal error:\n Request info:\n%s\narguments: %s\n' %\
                    (self.request, self.request.arguments),
                exc_info=True
            )
            raise tornado.web.HTTPError(500)

    @tornado.web.authenticated
    def post(self, thread_id):
        '''
            set thread as readed
        '''
        try:
            u2t_id, max_post_id = self.db.query(User2Thread.id, func.max(Post.id)).\
                        join(Post, User2Thread.thread_id == Post.thread_id).\
                        filter(User2Thread.user_id == self.current_user).\
                        filter(User2Thread.thread_id == thread_id).\
                        filter(
                            and_(
                                Post._start_date >= User2Thread._start_date,
                                Post._start_date <= User2Thread._stop_date
                            )
                        ).group_by(User2Thread.id).first()
            # logging.error(self.db.update)
            self.db.query(User2Thread).\
                filter_by(id=u2t_id).\
                update({'last_readed_post_id': max_post_id})
            self.db.commit()
        except:
            logging.error(
                'fatal error:\n Request info:\n%s\narguments: %s\n' %\
                    (self.request, self.request.arguments),
                exc_info=True
            )
            raise tornado.web.HTTPError(500)