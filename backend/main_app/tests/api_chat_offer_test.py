#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import logging
import urllib

from .tornado_testing_base import TornadoBaseTestCase

from ..models.thread import THREAD_TYPE

class APIChatOfferTestCase (TornadoBaseTestCase):
    
    @staticmethod
    def _get_offer_body():
        return 'chat_offer=%s' % json.dumps({
            'title': "Hello! I am a #test_offer and i have #tho_hashtags",
            'lang': ['russian', 'english']
        })

    def test10_add_offer(self):
        response = self.fetch(
            '/chat_offers',
            method='POST',
            body=self._get_offer_body()
        )
        self.assertEqual(response.code, 200)
        offers = json.loads(response.body.decode())['chat_offers']
        for o in offers.values():
            self.assertEqual(
                o['title'],
                "Hello! I am a #test_offer and i have #tho_hashtags"
            )

    def test11_add_offer_incorrect_data(self):
        response = self.fetch(
            '/chat_offers',
            method='POST',
            body="chat_offer=sdfsdf"
        )
        self.assertEqual(response.code, 406)

    def test21_get_offers(self):
        response = self.fetch(
            '/chat_offers',
            method='GET',
        )
        self.assertEqual(response.code, 200)
        offers = json.loads(response.body.decode())['chat_offers']
        self.assertEqual(len(offers.keys()), 1)
        id = list(offers.keys())[0]
        offer = offers[id]
        self.assertEqual(
            offer['title'],
            "Hello! I am a #test_offer and i have #tho_hashtags"
        )

    def test31_delete_offer(self):
        response = self.fetch(
            '/chat_offers/1',
            method='DELETE',
        )
        self.assertEqual(response.code, 200)
        response = self.fetch(
            '/chat_offers',
            method='GET',
        )
        self.assertEqual(response.code, 200)
        offers = json.loads(response.body.decode())['chat_offers']
        self.assertEqual(len(offers), 0)

    def test32_join_offer(self):
        response = self.fetch(
            '/chat_offers',
            method='POST',
            body=self._get_offer_body()
        )
        self.assertEqual(response.code, 200)
        offers = json.loads(response.body.decode())['chat_offers']
        id = list(offers.keys())[0]
        offer = offers[id]
        # response = self.fetch(
        #     '/chat_offer_join/%i' % int(offer['id']),
        #     method='POST',
        #     body='post=%s' % json.dumps({
        #         'text': 'hello'
        #     })
        # )
        body = {
            'users_id': json.dumps([offer['author_id']]),
            'offer_id': int(offer['id']),
            'post': json.dumps({'text': 'hello'})
        }
        response = self.fetch(
            '/thread',
            method='POST',
            body=urllib.parse.urlencode(body)
        )
        self.assertEqual(response.code, 200)
        thread_id = json.loads(response.body.decode())['thread_id']
        self.assertTrue(int(thread_id))