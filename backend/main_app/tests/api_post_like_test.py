#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import logging
import urllib

from .tornado_testing_base import TornadoBaseTestCase

POST_ID = None

class APIPostLikeTestCase(TornadoBaseTestCase):

    def add_post(self):
        '''
            add post
        '''
        post = dict(
            text='тест притест',
            thread_id=self.current_user.wall_thread_id
        )
        post = json.dumps(post)
        body = urllib.parse.urlencode(
            dict(
                post=post,
            )
        )
        response = self.fetch(
            '/post',
            method='POST',
            body=body,
        )
        if response.code == 200:
            return int(json.loads(response.body.decode())['new_post_id'])

    def test1_add_like(self):
        global POST_ID
        POST_ID = self.add_post()
        body = urllib.parse.urlencode(
            dict(
                post='post',
            )
        )
        response = self.fetch(
            '/post_likes/%i' % POST_ID,
            method='POST',
            body=body
        )
        self.assertEqual(response.code, 200)

    def test21_get_likes_brief(self):
        response = self.fetch('/post_likes_brief?posts_id=%i' % POST_ID)
        self.assertEqual(response.code, 200)
        likes = json.loads(response.body.decode())['post_likes']
        self.assertEqual(likes[str(POST_ID)]['count'], 1)
        self.assertEqual(likes[str(POST_ID)]['current_liked'], True)

    def test22_get_likes(self):
        response = self.fetch('/post_likes/%i' %POST_ID)
        self.assertEqual(response.code, 200)
        likes = json.loads(response.body.decode())['post_likes'][str(POST_ID)]
        self.assertEqual(likes['users_id'][0], self.current_user.id)
        self.assertEqual(likes['count'], 1)
        self.assertEqual(likes['current_liked'], True)

    def test3_recall_like(self):
        response = self.fetch('/post_likes/%i' % POST_ID, method='DELETE')
        self.assertEqual(response.code, 200)
        response = self.fetch('/post_likes/%i' %POST_ID)
        self.assertEqual(response.code, 404)