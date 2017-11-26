#!/usr/bin/env python3

import json
import logging

from .tornado_testing_base import TornadoBaseTestCase


class APIUsersTestCase(TornadoBaseTestCase):
    
    def test1_get_user(self):
        response = self.fetch('/users?id=1')
        self.assertEqual(response.code, 200)
        users = json.loads(response.body.decode())['users']
        self.assertTrue('1' in users)

    def test2_post_user(self):
        user = dict(
            firstname="Leo",
            birth_date = '1975-01-01T00:00:00',
            # email='leo@e.com',
            # pwd='hfpldfnhb',
            gender='male'
        )
        user_jsoined = json.dumps(user)
        body = 'user=%s' % user_jsoined
        response = self.fetch(
            '/user',
            method='POST',
            body=body
        )
        self.assertEqual(response.code, 200)
        self.assertTrue('user_id' in json.loads(response.body.decode()))
        user_id = json.loads(response.body.decode())['user_id']
        response = self.fetch('/users?id=%i' % user_id)
        user1 = json.loads(response.body.decode())['users'][str(user_id)]
        self.assertEqual(user1['firstname'], 'Leo')

    def test31_put_user(self):
        id = str(self.current_user.id)
        response = self.fetch('/users?id=%s' % id)
        user = json.loads(response.body.decode())['users'][id]
        user['firstname'] = "Leonid"
        user['birth_date'] = '1988-10-28T00:00:00'
        user_jsoined = json.dumps(user)
        body = 'user=%s' % user_jsoined
        response = self.fetch(
            '/user/%s' % id,
            method='PUT',
            body=body,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        self.assertEqual(response.code, 200)
        response = self.fetch('/users?id=%s' % id)
        user = json.loads(response.body.decode())['users'][id]
        self.assertEqual(user['firstname'], "Leonid")
        self.assertEqual(user['birth_date'], "1988-10-28T00:00:00")


    def test32_put_user_change_lang(self):
        id = str(self.current_user.id)
        response = self.fetch('/users?id=%s' % id)
        user = json.loads(response.body.decode())['users'][id]
        user['lang'] = ['egypt', 'klingon']
        user_jsoined = json.dumps(user)
        body = 'user=%s' % user_jsoined
        response = self.fetch(
            '/user/%s' % id,
            method='PUT',
            body=body,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        self.assertEqual(response.code, 200)
        response = self.fetch('/users?id=%s' % id)
        user = json.loads(response.body.decode())['users'][id]
