#!/usr/bin/env python3

import json
import urllib
import logging

from sqlalchemy import update, and_

from .tornado_testing_base import TornadoBaseTestCase
from ..models.post import Post
from ..models.thread import User2Thread



POST_COUNT = 4

class APIThreadsTestCase(TornadoBaseTestCase):

    @classmethod
    def setUpClass(cls):
        super(APIThreadsTestCase, cls).setUpClass()
        # add posts to thread
        for i in range(1,POST_COUNT):
            cls.current_user.wall_thread.posts.append(
                Post(
                    author_id=cls.current_user.id,
                    text=i
                )
            )
        u2t_last_update = update(User2Thread).\
            values(
                last_post_id=cls.current_user.wall_thread.posts[-1].id
            ).where(
                and_(
                    User2Thread.thread_id == cls.current_user.wall_thread_id,
                    User2Thread.is_current()
                )
            )
        cls.db.execute(u2t_last_update)
        cls.db.commit()

    def test11_get_threads_ok(self):
        threads = ','.join(
            [
                str(self.current_user.wall_thread_id),
                str(self.current_user.photo_thread_id)
            ]
        )
        response = self.fetch(
            '/threads?id=%s' % threads
        )
        self.assertEqual(response.code, 200)
        body = json.loads(response.body.decode())
        self.assertTrue(
            str(self.current_user.wall_thread_id) in body['threads']
        )
        
    def test21_get_nonexistent(self):
        response = self.fetch(
            '/threads?id=%s' % 987654
        )
        self.assertEqual(response.code, 404)

    def test31_get_chats(self):
        response = self.fetch('/chats')
        self.assertEqual(response.code, 200)