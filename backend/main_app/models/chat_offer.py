#!/usr/bin/env python3

from datetime import datetime

from sqlalchemy import Table, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from .basemodel import BaseModel
from .startstop_mixin import StartStopMixin
# from .user import User
from .post import Post, POST_TYPE

class ChatOffer(BaseModel, StartStopMixin):

    __tablename__ = 'chat_offers'

    id = Column('offer_id', Integer, primary_key=True)
    author_id = Column(
        Integer, ForeignKey('users.user_id'), index=True, nullable=False
    )
    title = Column(String(300), nullable=False)
    content_id = Column(Integer, ForeignKey('post_content.content_id'))

    _author = relationship('User', backref="chat_offers")

    content = relationship('ImageContent')

    @staticmethod
    def post_from_chat_offer(offer):
        return Post(
            text=offer.title,
            author_id=offer.author_id,
            type=POST_TYPE['CHAT_OFFER']
        )
        


# class AnswerChatOffer(BaseModel):

#     __tablename__ = 'answer_chat_offers'

#     offer_id = Column(
#         Integer, ForeignKey('chat_offers.offer_id'), primary_key=True
#     )
#     user_id = Column(
#         Integer, ForeignKey('users.user_id'), primary_key=True
#     )
    
#     date_time = Column(DateTime(timezone=False), default=datetime.utcnow)
    
#     offer = relationship('ChatOffer', backref='answers')
#     user = relationship('User', backref='user')
