#!/usr/bin/env python3

from datetime import datetime
import logging

from sqlalchemy import Table, Column, Integer, DateTime, String, ForeignKey, and_, or_, update
from sqlalchemy.orm import relationship

from .basemodel import BaseModel
from .startstop_mixin import StartStopMixin
from . import user
# from .user import User, DEFAULT_USER_ID
from .postcontent import PostContent
from .thread import PostThread, User2Thread, THREAD_TYPE


MAX_LEN = dict(
    text=1000
)

POST_TYPE = dict(
    REGULAR=1,
    CHAT_OFFER=2
)

class Post(BaseModel, StartStopMixin):
    
    __tablename__ = 'posts'
    
    id = Column('post_id', Integer, primary_key=True)
    type = Column(Integer, default=POST_TYPE['REGULAR'])
    text  = Column(String(MAX_LEN['text']))
    author_id = Column(Integer, ForeignKey('users.user_id'), index=True)
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    parent_id = Column(Integer, ForeignKey('posts.post_id'), index=True)
    content_id = Column(Integer, ForeignKey('post_content.content_id'))
    thread_id = Column(
        Integer, ForeignKey('threads.thread_id'),
        index=True, nullable=False
    )
    comment_thread_id = Column(Integer, ForeignKey('threads.thread_id'))
    
    _author = relationship(
        'User',
        primaryjoin = 'Post.author_id == User.id'
    )
    children = relationship(
        'Post',
        primaryjoin = 'Post.id == Post.parent_id'
    )
    thread = relationship(
        'PostThread',
        primaryjoin = 'Post.thread_id == PostThread.id'
    )
    _comment_thread = relationship(
        'PostThread',
        primaryjoin = 'Post.comment_thread_id == PostThread.id'
    )
    content = relationship('ImageContent')
    
    def __init__(self, text='', content_id=0, *args, **kwargs):
        super(Post, self).__init__(*args, **kwargs)
        if not str(text) and not int(content_id):
            raise ValueError("a post can't be empty'")
        self.text = text
        self.content_id = content_id or None

    def add_comment_thread(self):
        self._comment_thread = PostThread(type=THREAD_TYPE['COMMENT'])
        for user_id in (self.author_id, user.DEFAULT_USER_ID):
            self._comment_thread.user2thread.append(
                User2Thread(user_id=user_id)
            )
        return 1
    
    @property
    def export_dict(self):
        export_dict = super(Post, self).export_dict
        export_dict['datetime'] = self._start_date
        return export_dict

    def update_u2t(self):
        '''update user2thread.last_post'''
        return update(User2Thread).\
            values(
                last_post_id=self.id
            ).where(
                and_(
                    User2Thread.thread_id == self.thread_id,
                    User2Thread.is_current()
                )
            )

    @staticmethod
    def check_user_post(post):
        allowed_keys = ('text', 'content_id', 'thread_id')
        for k in post:
            if k not in allowed_keys:
                logging.error(k)
                return 0
        return 1


class PostAnswer(BaseModel):
    
    __tablename__ = 'post_answers'

    post_id = Column(
        Integer, ForeignKey('posts.post_id'), primary_key=True
    )
    user_id = Column(
        Integer, ForeignKey('users.user_id'), primary_key=True
    )
    
    date_time = Column(DateTime(timezone=False), default=datetime.utcnow)
    
    post = relationship('Post', backref='answers')
    user = relationship('User', backref='user')
