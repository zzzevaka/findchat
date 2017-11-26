#!/usr/bin/env python3

import logging
import unittest
from datetime import datetime

from sqlalchemy import func
from sqlalchemy.sql import select
from sqlalchemy.orm.query import Query
from sqlalchemy.dialects import postgresql

from ..models.user import User
from ..models.hashtag import Hashtag, HashTagInterface, hashtag2post, hashtag2user
from ..models.thread import PostThread
from ..models.post import Post

import __main__ as main


class ModelHashtagTestCase(unittest.TestCase, HashTagInterface):
    
    @property
    def db(self):
        return self.session
    
    @classmethod
    def setUpClass(cls):
        cls.session = main.SessionMaker()
        cls.user = User(
            wall_thread=PostThread(),
            photo_thread=PostThread()
        )
        cls.session.add(cls.user)
        cls.session.commit()

    def test1_hastag2user(self):
        self.user.hashtags.append(
            Hashtag(name='user_tag')
        )
        self.session.commit()

    def test2_hashtag2post(self):
        post = Post(text='lala')
        self.user.wall_thread.posts.append(post)
        post.hashtags.append(
            Hashtag(name="post_tag")
        )
        self.session.commit()

    def test3_users_by_hashtag(self):
        subquery = self.query_user2thread_count(['user_tag','post_tag']).subquery()
        result = self.session.query(
                User
            ).join(
                subquery, User.id == subquery.c.user_id
            ).order_by(
                subquery.c.hashtag_count.desc()
            ).all()
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].id, self.user.id)

    def test4_hashtags_from_string(self):
        sentense = 'i like #footbal and #guitar'
        hashtags = Hashtag.hashtags_from_string(sentense)
        # self.assertEqual(
        #     ['footbal', 'guitar'],
        #     hashtags
        # )