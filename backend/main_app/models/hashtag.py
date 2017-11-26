#!/usr/bin/env python3

from sqlalchemy import Column, Integer, String, ForeignKey, func
from sqlalchemy.orm import relationship
from sqlalchemy.schema import Table

from .basemodel import BaseModel
# from .user import User
from .post import Post
from .chat_offer import ChatOffer

STRIP_CHARS = '#,.!?:'

hashtag2user = Table(
    'hashtag2user', BaseModel.metadata,
    Column('hashtag_id', Integer, ForeignKey('hashtags.hashtag_id'), index=True),
    Column('user_id', Integer, ForeignKey('users.user_id'), index=True),
)

hashtag2post = Table(
    'hashtag2post', BaseModel.metadata,
    Column('hashtag_id', Integer, ForeignKey('hashtags.hashtag_id'), index=True),
    Column('post_id', Integer, ForeignKey('posts.post_id'), index=True),
)

hashtag2chatoffer = Table(
    'hashtag2chatoffer', BaseModel.metadata,
    Column('hashtag_id', Integer, ForeignKey('hashtags.hashtag_id'), index=True),
    Column('offer_id', Integer, ForeignKey('chat_offers.offer_id'), index=True),
)

class Hashtag(BaseModel):

    __tablename__ = 'hashtags'

    id = Column('hashtag_id', Integer, primary_key=True)
    name = Column(String(100), nullable=False, index=True)

    users = relationship(
        'User',
        secondary=hashtag2user,
        backref="hashtags"
    )
    posts = relationship(
        'Post',
        secondary=hashtag2post,
        backref="hashtags"
    )

    chatoffers = relationship(
        'ChatOffer',
        secondary=hashtag2chatoffer,
        backref="hashtags"
    )

    @staticmethod
    def hashtags_from_string(string):
        return set(
            [w.strip(STRIP_CHARS).lower() for w in string.split() if w.startswith('#')]
        )

    @staticmethod
    def get_hashtags_from_string(string, alchemy_session):
        tag_strings = Hashtag.hashtags_from_string(string)
        tag_objects = alchemy_session.query(Hashtag).filter(
                Hashtag.name.in_(tag_strings)
            ).all()
        # create new
        for tag in tag_objects:
            tag_strings.remove(tag.name)
        for tag in tag_strings:
            tag_objects.append(Hashtag(name=tag))
        return tag_objects

class HashTagInterface():

    def query_user2thread_count(self, hashtags):
        '''
            prepare subqery for get user_id, count(hashtag_id)
        '''
        return self.db.query(
            hashtag2user.c.user_id,
            func.count(hashtag2user.c.hashtag_id).label('hashtag_count')
        ).join(
            Hashtag, hashtag2user.c.hashtag_id == Hashtag.id
        ).filter(
            Hashtag.name.in_(hashtags)
        ).group_by(
            hashtag2user.c.user_id
        )

    @staticmethod
    def get_hashtags_from_string(string, alchemy_session):
        tag_strings = Hashtag.hashtags_from_string(string)
        tag_objects = alchemy_session.query(Hashtag).filter(
                Hashtag.name.in_(tag_strings)
            ).all()
        # create new
        for tag in tag_objects:
            tag_strings.remove(tag.name)
        for tag in tag_strings:
            tag_objects.append(Hashtag(name=tag))
        return tag_objects
            
