#!/usr/bin/env python3

import urllib
from tornado.escape import json_decode, json_encode
import logging

from .tornado_testing_base import TornadoBaseTestCase, PASSWORD


class APIAuthTestCase(TornadoBaseTestCase):

    def test10_login_failed(self):
        body = urllib.parse.urlencode({
            'login': self.auth.login,
            'password': 'PASSWORD'
        })
        response = self.fetch(
            '/login',
            method='POST',
            body=body,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        self.assertEqual(response.code, 403)

    def test11_login_success(self):
        body = urllib.parse.urlencode({
            'login': self.auth.login,
            'password': PASSWORD
        })
        response = self.fetch(
            '/login',
            method='POST',
            body=body,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        self.assertEqual(response.code, 200)
        user_id = json_decode(response.body)['user_id']
        self.assertEqual(int(user_id), self.current_user.id)


    def test21_auth_put_login_invalid_format_failed(self):
        body = json_encode({
            'auth': {
                'login': 'ulalal',
            }
        })
        response = self.fetch(
            '/auth',
            method='PUT',
            body=body,
            headers={"Content-Type": "application/json"}
        )
        self.assertEqual(response.code, 400)

    def test22_auth_put_login_exists_failed(self):
        body = json_encode({
            'auth': {
                'login': 'zzzevaka@gmail.com',
            }
        })
        response = self.fetch(
            '/auth',
            method='PUT',
            body=body,
            headers={"Content-Type": "application/json"}
        )
        self.assertEqual(response.code, 409)


    def test23_auth_put_login_success(self):
        body = json_encode({
            'auth': {
                'login': 'new_mail@mail.io',
            }
        })
        response = self.fetch(
            '/auth',
            method='PUT',
            body=body,
            headers={"Content-Type": "application/json"}
        )
        self.assertEqual(response.code, 200)

    def test24_auth_put_password_incorrect_failed(self):
        body = json_encode({
            'auth': {
                'password': '11',
            }
        })
        response = self.fetch(
            '/auth',
            method='PUT',
            body=body,
            headers={"Content-Type": "application/json"}
        )
        self.assertEqual(response.code, 409)


    def test24_auth_put_password_success(self):
        body = json_encode({
            'auth': {
                'password': 'qwerty',
            }
        })
        response = self.fetch(
            '/auth',
            method='PUT',
            body=body,
            headers={"Content-Type": "application/json"}
        )
        self.assertEqual(response.code, 200)

    def test25_auth_get(self):
        response = self.fetch('/auth?password=qwerty')
        self.assertEqual(response.code, 200)
        self.assertEqual(
            json_decode(response.body)['login'],
            'new_mail@mail.io'
        )