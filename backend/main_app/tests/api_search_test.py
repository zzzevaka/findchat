#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import logging
import urllib
from datetime import datetime

from .tornado_testing_base import TornadoBaseTestCase

from ..models.user import User
from ..models.chat_offer import ChatOffer
from ..models.thread import PostThread
from ..models.language import Language
from ..models.hashtag import Hashtag, HashTagInterface


class APISearchTestCase (TornadoBaseTestCase):
    
    @classmethod
    def setUpClass(cls):
        super(APISearchTestCase, cls).setUpClass()
        cls.users = []
        cls.offers = []
        # create users
        for i in range(10):   
            cls.users.append(
                User(
                    firstname=cls.__name__ + str(i),
                    wall_thread=PostThread(),
                    photo_thread=PostThread()
                )
            )
        langs = Language.get_languages_from_db(
            ['english', 'russian', 'korean'], cls.db
        )
        tags = HashTagInterface.get_hashtags_from_string(
            '#football #cinema #cars',
            cls.db
        )
        # add languages to users
        for i in range(6):
            cls.users[i].update_languages(langs)
        # add hastags to users
        for i in range(3,8):
            for tag in tags:
                cls.users[i].hashtags.append(tag)
        cls.db.add_all(cls.users)
        cls.db.commit()
        # create chat_offers
        for i in range(10):
            cls.offers.append(
                ChatOffer(
                    author_id=cls.current_user.id,
                    title=str(i)
                )
            )
        # add languages to users
        for i in range(6):
            for lang in langs:
                cls.offers[i].languages.append(lang)
        # add hastags to users
        for i in range(3,8):
            for tag in tags:
                cls.offers[i].hashtags.append(tag)
        cls.db.add_all(cls.offers)
        cls.db.commit()    

    def test11_user(self):
        filter = json.dumps({
            'lang': ['english', 'japan'],
            'hashtags': ['cinema', 'cars']
        })
        response = self.fetch(
            '/search/users',
            method='POST',
            body='filter=%s' % filter
        )
        self.assertEqual(response.code, 200)

    def test12_user_limit(self):
        filter = json.dumps({
            'lang': ['english'],
            'hashtags': ['cinema', 'cars'],
            'limit': 1,
            'offset': 2
        })
        response = self.fetch(
            '/search/users',
            method='POST',
            body='filter=%s' % filter
        )
        self.assertEqual(response.code, 200)

    def test21_chat_offer(self):
        filter = json.dumps({
            'lang': ['english', 'japan'],
            'hashtags': ['cinema', 'cars']
        })
        response = self.fetch(
            '/search/chat_offers',
            method='POST',
            body='filter=%s' % filter
        )
        self.assertEqual(response.code, 200)