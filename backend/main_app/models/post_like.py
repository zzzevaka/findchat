#!/usr/bin/env python3

from sqlalchemy import Table, Column, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from .basemodel import BaseModel
from .user import User
from .post import Post

class PostLike(BaseModel):

    __tablename__ = 'post_likes'

    id = Column('like_id', Integer, primary_key=True)
    author_id = Column(Integer, ForeignKey('users.user_id'), index=True)
    post_id = Column(Integer, ForeignKey('posts.post_id'), index=True)
    recall = Column(Boolean, default='false')

    post = relationship(Post, backref='likes')
    user = relationship(User, backref='post_likes')