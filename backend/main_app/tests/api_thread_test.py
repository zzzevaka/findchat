#!/usr/bin/env python3

import json
import logging
import urllib

from .tornado_testing_base import TornadoBaseTestCase
from ..models.post import Post

POST_COUNT = 50

class APIThreadTestCase(TornadoBaseTestCase):
    
    @classmethod
    def setUpClass(cls):
        super(APIThreadTestCase, cls).setUpClass()
        # add posts to thread
        for i in range(1,POST_COUNT):
            cls.current_user.wall_thread.posts.append(
                Post(
                    author_id=cls.current_user.id,
                    text=i
                )
            )
            cls.db.commit()

    def test1_get(self):
        response = self.fetch(
            '/thread/%i' % self.current_user.wall_thread_id
        )
        self.assertEqual(response.code, 200)
        
    def test2_get_with_limit(self):
        t_id = self.current_user.wall_thread_id
        response = self.fetch(
            '/thread/%i?limit=10' % t_id
        )
        self.assertEqual(response.code, 200)
        body = json.loads(response.body.decode())
        posts_id = body['threads'][str(t_id)]['posts']
        self.assertEqual(len(posts_id), 10)
        self.assertEqual(
            body['posts'][str(posts_id[0])]['text'],str( POST_COUNT-1)
        )
        self.assertEqual(
            body['posts'][str(posts_id[-1])]['text'], str(POST_COUNT-10)
        )

    def test3_get_with_limit_and_offset(self):
        t_id = self.current_user.wall_thread_id
        response = self.fetch(
            '/thread/%i?limit=10&offset=10' % t_id
        )
        self.assertEqual(response.code, 200)
        body = json.loads(response.body.decode())
        posts_id = body['threads'][str(t_id)]['posts']
        self.assertEqual(len(posts_id), 10)
        self.assertEqual(
            body['posts'][str(posts_id[0])]['text'], str(POST_COUNT-11)
        )
        self.assertEqual(
            body['posts'][str(posts_id[-1])]['text'], str(POST_COUNT-20)
        )

    def test4_get_chat_offers(self):
        params = dict(
            limit=5,
            offset=0,
            filter=json.dumps({'tags': []})
        )
        body = urllib.parse.urlencode(params)
        response = self.fetch(
            '/thread/chat_offers',
            method='POST',
            body=body
        )
        self.assertEqual(response.code, 200)

    def test4_get_chat_offers(self):
        params = dict(
            limit=5,
            offset=0,
            filter=json.dumps({'tags': []})
        )
        body = urllib.parse.urlencode(params)
        response = self.fetch(
            '/thread/search_users',
            method='POST',
            body=body
        )
        self.assertEqual(response.code, 200)









