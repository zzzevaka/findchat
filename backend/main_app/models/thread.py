#!/usr/bin/env python3

from datetime import datetime

from sqlalchemy import Table, Column, Integer, String, DateTime, Boolean, ForeignKey, and_,or_
from sqlalchemy.orm import relationship, joinedload, backref
from sqlalchemy.ext.declarative import declared_attr

from .basemodel import BaseModel
from .startstop_mixin import StartStopMixin
# from .user import User
# from .post import Post

import logging

MAX_LEN = dict(
    title=300
)

THREAD_TYPE = dict(
    PUBLIC=1,
    COMMENT=2,
    PRIVATE_CHAT=3,
    GROUP_CHAT=4,
    CHAT_OFFER=5,
)


class PostThread(BaseModel):
    
    __tablename__ = 'threads'
    
    id = Column('thread_id', Integer, primary_key=True)
    title = Column(String(MAX_LEN['title']))
    type = Column(Integer, default=THREAD_TYPE['PUBLIC'])
    
    posts = relationship('Post', primaryjoin = 'PostThread.id == Post.thread_id', lazy='noload')

    def add_post(self, post, users_read, last=False):
        self.posts.append(post)
        if users_read or last:
            for u2t in self.user2thread:
                if u2t.is_current():
                    if last:
                        u2t.last_post = post
                    if u2t.user_id in users_read:
                        u2t.last_readed_post = post


    @staticmethod
    def users_id_to_key(users_id):
        '''
            [3,1,54] => '1,3,54'
        '''
        return ','.join(map(str, sorted(set(users_id))))

    @staticmethod
    def key_to_users_id(key):
        '''
            '1,3,54' => [1,3,54]
        '''
        return [int(i) for i in key.split(',')]

    @staticmethod
    def get_chat_between_users(users, session):
        return session.query(
                PostThread
            ).join(
                User2Thread
            ).options(
                joinedload(PostThread.user2thread)
            ).filter(
                User2Thread.key == PostThread.users_id_to_key(users)
            ).filter(
                PostThread.type == THREAD_TYPE['PRIVATE_CHAT']
            ).filter(
                User2Thread.is_current()
            )

    @staticmethod
    def get_actual_chat(users, session, create=False):
        '''
            creates and returns a chat thread between users
            if the thread does already exist just returns
        '''
        thread = None
        key = PostThread.users_id_to_key(users)
        user2threads = {u_id: None for u_id in users}
        logging.debug(users)
        logging.debug(user2threads)
        # get thread if exists
        result = PostThread.get_chat_between_users(
            users,
            session
        ).all() 
        # the thread was found
        if len(result):
            # thread = result[0].thread
            thread = result[0]
            # write user2thread instance to thread_members if they are current
            logging.error('hello')
            for u2t in thread.user2thread:
                logging.error(u2t._start_date)
                logging.error(u2t._stop_date)
                if u2t.is_current():
                    user2threads[u2t.user_id] = u2t
        # the thread wasn't found
        else:
            # if create flag wasn't set, returns nothing
            if not create:
                return
            # creating thread
            thread = PostThread(type=THREAD_TYPE['PRIVATE_CHAT'])
            session.add(thread)
        # create new user2thread isinstances if it's needed
        for u_id, u2t in user2threads.items():
            if not u2t and create:
                thread.user2thread.append(
                    User2Thread(
                        user_id=u_id,
                        key=key,
                        _start_date = datetime.utcnow(),
                        _stop_date = User2Thread.max_date()
                    )
                )
        return thread


class User2ThreadAbstract(BaseModel, StartStopMixin):

    __abstract__ = True

    id = Column('u2t_id', Integer, primary_key=True)

    @declared_attr
    def user_id(self):
        return Column(Integer, ForeignKey('users.user_id'))

    @declared_attr
    def thread_id(self):
        return Column(Integer, ForeignKey('threads.thread_id'))


    @declared_attr
    def user(cls):
        return relationship(
            'User',
            primaryjoin='%s.user_id == User.id' % cls.__name__,
            backref=cls.__name__.lower()
        )

    @declared_attr
    def thread(cls):
        return relationship(
            'PostThread',
            backref=cls.__name__.lower()
        )

class User2Thread(User2ThreadAbstract):

    __tablename__ = 'user2thread'

    key = Column(String, index=True)
    last_post_id = Column(Integer, ForeignKey('posts.post_id'))
    private_with_id = Column(Integer, ForeignKey('users.user_id'), index=True)
    last_readed_post_id = Column(Integer, ForeignKey('posts.post_id'), nullable=True)

    last_post = relationship(
        'Post',
        primaryjoin = 'User2Thread.last_post_id == Post.id',
    )
    last_readed_post = relationship(
        'Post',
        primaryjoin = 'User2Thread.last_readed_post_id == Post.id'
    )
    private_with = relationship(
        'User',
        primaryjoin="User2Thread.private_with_id == User.id",
    )

    allow_add_posts = Column(Boolean, default=True)
    allow_del_posts = Column(Boolean, default=False)
    allow_add_comments = Column(Boolean, default=True)
    allow_show_comments = Column(Boolean, default=True)

    @staticmethod
    def users_id_to_key(users_id):
        '''
            [3,1,54] => '1,3,54'
        '''
        return ','.join(map(str, sorted(set(users_id))))

    @property
    def chat_members(self):
        '''
            parse users_id from self.key
        '''
        logging.debug(self.key)
        # logging.error([self.user_id == int(i) for i in self.key])
        return [int(i) for i in self.key.split(',') if int(i) != self.user_id]


class IgnoredPosts(BaseModel):

    __tablename__ = 'ignored_posts'

    u2t_id = Column(Integer, ForeignKey('user2thread.u2t_id'), primary_key=True)
    post_id = Column(Integer, ForeignKey('posts.post_id'), primary_key=True)
    del_time = Column(DateTime(timezone=False), nullable=False, default=datetime.utcnow)
    del_user_id = Column(Integer, nullable=False)

    user2thread = relationship('User2Thread', backref='ignored_posts')
    post = relationship('Post', backref='ignored_posts')