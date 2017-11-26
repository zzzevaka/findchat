#!/usr/bin/env python3

import logging

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.schema import Table

from .basemodel import BaseModel
from .chat_offer import ChatOffer


lang2user = Table(
    'lang2user', BaseModel.metadata,
    Column('lang_id', Integer, ForeignKey('languages.lang_id'), index=True),
    Column('user_id', Integer, ForeignKey('users.user_id'), index=True),
)

lang2chatoffer = Table(
    'lang2chatoffer', BaseModel.metadata,
    Column('lang_id', Integer, ForeignKey('languages.lang_id'), index=True),
    Column('offer_id', Integer, ForeignKey('chat_offers.offer_id'), index=True),
)


class Language(BaseModel):

    __tablename__ = 'languages'

    id = Column('lang_id', Integer, primary_key=True)
    name = Column(String(100), nullable=False, index=True)
    native_name = Column(String(100), nullable=True, index=False)
    code = Column(String(10), nullable=True, index=False)

    users = relationship(
        'User',
        secondary=lang2user,
        backref="_languages",
        collection_class=set
    )

    chatoffers = relationship(
        'ChatOffer',
        secondary=lang2chatoffer,
        backref="languages"
    )

    @staticmethod
    def is_language(lang):
        '''
            checking language
        '''
        try:
            return lang.isalpha()
        except:
            return False

    @staticmethod
    def get_languages_from_db(langs, alchemy_session):
        '''get SQLAlchemy isinstances from DB'''
        # delete duplicates and do str.lower()
        langs = set([l.lower().title() for l in langs if Language.is_language(l)])
        query = alchemy_session.query(
                Language
            ).filter(
                Language.name.in_(langs)
            )
        logging.debug(query)
        lang_instances = query.all()
        # create new languages if it is needed
        for inst in lang_instances:
            langs.remove(inst.name)
        for lang_name in langs:
            lang_instances.append(
                Language(name=lang_name)
            )
        return lang_instances
