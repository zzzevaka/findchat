#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import logging
import unittest
from tornado_testing_base import TornadoBaseTestCase
from main_app.models.user import FollowUser

DST_USER_ID = 6

class APIUserFollowersTestCase(TornadoBaseTestCase):

    @classmethod
    def setUpClass(cls):
        super(APIUserFollowersTestCase, cls).setUpClass()
        for i in range(1,DST_USER_ID):
            cls.db.add(
                FollowUser(
                    src_user_id=i,
                    dst_user_id=DST_USER_ID
                )
            )
            cls.db.commit()

    ########################
    # START FOLLOW (POST)
    ########################

    def test30_post_follow_success(self):
        response = self.fetch(
            '/user/2/follow',
            method='POST',
            body=''
        )
        self.assertEqual(response.code, 200)
        f = self.db.query(FollowUser).\
            filter_by(src_user_id=self.current_user.id).\
            filter_by(dst_user_id=2).first()
        self.assertTrue(f)

    def test31_post_follow_double(self):
        response = self.fetch(
            '/user/2/follow',
            method='POST',
            body='dst_user_id=2'
        )
        self.assertEqual(response.code, 409)

    ########################
    # STOP FOLLOW (DELETE)
    ########################

    def test40_delete_follow_success(self):
        response = self.fetch(
            '/user/2/follow',
            method='DELETE',
        )
        self.assertEqual(response.code, 200)

    def test41_delete_follow_not_found(self):
        response = self.fetch(
            '/user/2/follow',
            method='DELETE',
        )
        self.assertEqual(response.code, 404)

    ########################
    # GET FOLLOWERS (GET)
    ########################

    def test50_get_followers(self):
        response = self.fetch('/user/%i/followers' % DST_USER_ID)
        self.assertEqual(response.code, 200)
        thread = json.loads(response.body)['threads']['user_followers_%s' % DST_USER_ID]
        logging.error(response.body)
        self.assertEqual(len(thread['posts']), 5)
        self.assertTrue(thread['no_more_posts'])

    ########################
    # GET FOLLOWING (GET)
    ########################

    def test61_get_following(self):
        for id in range(1,4):
            self.fetch('/user/%i/follow' % id, method='POST', body='')
        response = self.fetch('/user/%i/following' % self.current_user.id)
        self.assertEqual(response.code, 200)
        thread = json.loads(response.body)['threads']['user_following_%s' % self.current_user.id]
        self.assertEqual(len(thread['posts']), 3)
        self.assertTrue(thread['no_more_posts'])

    def test62_get_following_limit(self):
        response = self.fetch('/user/%i/following?limit=1' % self.current_user.id)
        self.assertEqual(response.code, 200)
        thread = json.loads(response.body)['threads']['user_following_%s' % self.current_user.id]
        self.assertEqual(len(thread['posts']), 1)
        self.assertFalse(thread['no_more_posts'])

    def test63_get_following_limit_offset(self):
        response = self.fetch('/user/%i/following?limit=2&offset=1' % self.current_user.id)
        self.assertEqual(response.code, 200)
        thread = json.loads(response.body)['threads']['user_following_%s' % self.current_user.id]
        self.assertEqual(len(thread['posts']), 2)
        self.assertFalse(thread['no_more_posts'])


if __name__ == '__main__':
    logging.basicConfig(level=logging.ERROR)
    unittest.main()