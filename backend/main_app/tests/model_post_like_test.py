#!/usr/bin/env python3

import logging
import unittest

from sqlalchemy.exc import IntegrityError

from ..models.post import Post
from ..models.user import User
from ..models.post_like import PostLike
from ..models.thread import PostThread

import __main__ as main

class ModelPostLikeTestCase(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.session = main.SessionMaker()
        cls.user = cls.session.query(User).first()
        cls.thread = PostThread()
        cls.session.add(cls.thread)
        cls.session.commit()

    def test1_add_like(self):
        post = Post(text='lalal')
        self.thread.posts.append(post)
        post.likes.append(PostLike(user=self.user))
        self.session.commit()
