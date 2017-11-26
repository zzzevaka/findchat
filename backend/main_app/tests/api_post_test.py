#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import logging
import urllib
import json
from datetime import datetime

from PIL import Image
from io import StringIO, BytesIO
import base64

from .tornado_testing_base import TornadoBaseTestCase

from ..models.post import Post
from ..models.thread import THREAD_TYPE


POST_ID = None

class APIPostTestCase(TornadoBaseTestCase):
    
    def test11_post_empty(self):
        post = dict(
            text='',
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
        self.assertEqual(response.code, 406)

    def test12_post_success(self):
        post = dict(
            text='тест притест, а вот и #хэштег',
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
        self.assertEqual(response.code, 200)
        global POST_ID
        body = json.loads(response.body.decode())
        new_post_id = body['new_post_id']
        self.assertEqual(body['posts'][str(new_post_id)]['text'], 'тест притест, а вот и #хэштег')
        POST_ID = new_post_id
        self.assertTrue(POST_ID)
        
    def test13_get(self):
        response = self.fetch('/post/%i' % POST_ID)
        self.assertEqual(response.code, 200)
        post = json.loads(response.body.decode())['posts'][str(POST_ID)]
        # self.assertEqual(len(post['children']), 0)
        
    def test14_get_assert_404(self):
        response = self.fetch('/post/100000')
        self.assertEqual(response.code, 404)

    def test21_post_with_image_content(self):
        raw_img = Image.new('RGBA', (1024,768), (255,255,255))
        out = BytesIO()
        raw_img.save(out, format='PNG')
        img = dict(src=base64.b64encode(out.getvalue()).decode())
        response = self.fetch(
            '/image',
            method='POST',
            body=urllib.parse.urlencode({'img': json.dumps(img)})
        )
        self.assertEqual(response.code, 200)
        img_id = json.loads(response.body.decode())['img']['id']
        text = 'hello'
        post = dict(
            thread_id=self.current_user.wall_thread_id,
            text='hello #хэштег',
            content_id=img_id
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
            body=body
        )
        self.assertEqual(response.code, 200)
        response = self.fetch('/post/%i' % 106)

    def test31_delete_post(self):
        response = self.fetch(
            '/post/%i' % POST_ID,
            method='DELETE'
        )
        self.assertEqual(response.code, 200)

    def test32_add_chat_offer(self):
        post = {
            'text': 'чат оффер с #хэштег',
            'thread_id': self.current_user.offer_thread_id
        }
        body = urllib.parse.urlencode({'post': json.dumps(post)})
        response = self.fetch('/post', method='POST', body=body)
        self.assertEqual(response.code, 200)
        global POST_ID
        body = json.loads(response.body.decode())
        new_post_id = body['new_post_id']
        self.assertEqual(body['posts'][str(new_post_id)]['text'], 'чат оффер с #хэштег')
        POST_ID = new_post_id
        self.assertTrue(POST_ID)

    def test33_answer_offer_post(self):
        post = {'text': 'hi'}
        body = urllib.parse.urlencode({
            'post': json.dumps(post),
            'offer_id': POST_ID
        })
        response = self.fetch('/thread', method='POST', body=body)
        self.assertEqual(response.code, 200)
        logging.error(response.body)

    
class APIUnreadedPostCount(TornadoBaseTestCase):

    @classmethod
    def setUpClass(cls):
        POST_COUNT = 10
        super(APIUnreadedPostCount, cls).setUpClass()
        last_post = None
        last_readed_post = None
        # add posts to thread
        for i in range(1,POST_COUNT):
            post = Post(author_id=cls.current_user.id, text=i)
            cls.current_user.wall_thread.posts.append(post)
            if i == POST_COUNT - 1:
                last_post = post
            if i == POST_COUNT - 6:
                last_readed_post = post
        for u2t in cls.current_user.wall_thread.user2thread:
            u2t.last_post_id = last_post.id
            u2t.last_readed_post_id = last_readed_post.id
        cls.current_user.wall_thread.type = THREAD_TYPE['PRIVATE_CHAT']
        cls.db.commit()

    def test1_get(self):
        response = self.fetch(
            '/unreaded_posts',
            method='GET'
        )
        self.assertEqual(response.code, 200)
        unreaded_posts = json.loads(response.body.decode())['unreaded_posts']
        self.assertEqual(
            unreaded_posts['threads'][str(self.current_user.wall_thread_id)], 5
        )
        self.assertEqual(
            unreaded_posts['sum'], 5
        )

    def test2_post(self):
        for u2t in self.current_user.wall_thread.user2thread:
            if u2t.user_id == self.current_user:
                self.assertNotEqual(
                    u2t.last_post_id, u2t.last_readed_post_id
                )
        response = self.fetch(
            '/unreaded_posts/%i' % self.current_user.wall_thread_id,
            method='POST',
            body=''
        )
        self.assertEqual(response.code, 200)
        for u2t in self.current_user.wall_thread.user2thread:
            if u2t.user_id == self.current_user:
                self.assertEqual(
                    u2t.last_post_id, u2t.last_readed_post_id
                )