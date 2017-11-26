#!/usr/bin/env python3

import urllib
import logging
import json
from datetime import datetime

from tornado.testing import AsyncHTTPTestCase
from tornado.httpclient import AsyncHTTPClient, HTTPRequest
from tornado.httputil import HTTPHeaders

from ..handlers import *
from ..app import MainApp

import __main__ as main

TEST_USER_ID = None
SESSION_ID = None

class APIUsersTestCase(AsyncHTTPTestCase):
    
    @classmethod
    def setUpClass(cls):
        cls.db = main.SessionMaker()
        
    def get_app(self):
        return MainApp(main.db_engine, main.redis_conn, debug=False)
        
    def test11_post_success(self):
        params = dict(
            email='test@email.com',
            username='test',
            firstname='Test',
            birth_date='1970-01-01T00:00:00',
            gender='male',
            pwd='test'
        )
        body = urllib.parse.urlencode(params)
        response = self.fetch(
            '/user',
            method='POST',
            body=body
        )
        self.assertEqual(response.code, 200)
        global TEST_USER_ID
        TEST_USER_ID = json.loads(response.body.decode())['user_id']
    
    def test12_post_birth_date_incoorect(self):
        params = dict(
            email='test@email.com',
            username='test',
            firstname='Test',
            birth_date='01.01.1970',
            gender='male',
            pwd='test',
            session_id=SESSION_ID
        )
        body = urllib.parse.urlencode(params)
        response = self.fetch(
            '/user',
            method='POST',
            body=body
        )
        self.assertEqual(response.code, 409)
        
    def test13_post_params_missed(self):
        params = dict(
            username='test',
            gender='male',
            pwd='test'
        )
        body = urllib.parse.urlencode(params)
        response = self.fetch(
            '/user',
            method='POST',
            body=body
        )
        self.assertEqual(response.code, 400)

    def test14_duplicate_email(self):
        params = dict(
            email='test@email.com',
            username='test_testovich',
            firstname='Test',
            birth_date='1970-01-01T00:00:00',
            gender='male',
            pwd='test'
        )
        body = urllib.parse.urlencode(params)
        response = self.fetch(
            '/user',
            method='POST',
            body=body
        )
        self.assertEqual(response.code, 409)
        
    def test15_invalid_email(self):
        params = dict(
            email='test@email',
            username='test_testovich',
            firstname='Test',
            birth_date='1970-01-01T00:00:00',
            gender='male',
            pwd='test'
        )
        body = urllib.parse.urlencode(params)
        response = self.fetch(
            '/user',
            method='POST',
            body=body
        )
        self.assertEqual(response.code, 409)

    def test2_login(self):
        body = urllib.parse.urlencode(
            dict(
                email='test@email.com',
                pwd='test'
            )
        )
        response = self.fetch('/login', method='POST', body=body)
        self.assertEqual(response.code, 200)
        global SESSION_ID
        cookie = response.headers['Set-Cookie'].split(';')
        cookie = [c for c in cookie if 'session_id' in c]
        SESSION_ID = cookie[0].split('session_id=')[1]

class APIUserTestCase(AsyncHTTPTestCase):
    
    @classmethod
    def setUpClass(cls):
        cls.db = main.SessionMaker()
        
    def get_app(self):
        return MainApp(main.db_engine, main.redis_conn, debug=False)
        
    def test1_get_user(self):
        response = self.fetch('/user/%i?session_id=%s' % (
                TEST_USER_ID, SESSION_ID
            )
        )
        self.assertEqual(response.code, 200)
        user = json.loads(response.body.decode())['user']
        self.assertEqual(user['id'], TEST_USER_ID)
        self.assertEqual(user['firstname'], 'Test')
        self.assertFalse('email' in user)
        
    def test2_put_user(self):
        response = self.fetch('/user/%i?session_id=%s' % (
                TEST_USER_ID, SESSION_ID
            )
        )
        user = json.loads(response.body.decode())['user']
        user['firstname'] = 'TestTest'
        user['lastname'] = 'upalala'
        user['birth_date'] = '1988-10-28T00:00:00'
        wall_thread = user['wall_thread_id']
        photo_thread = user['photo_thread_id']
        user['wall_thread_id'] = 123
        user['post_thread_id'] = 989
        user['lang'] = ['Ulalal', 'Kruru']
        user = json.dumps(user)
        params = dict(
            user=user,
            session_id=SESSION_ID
        )
        body = urllib.parse.urlencode(params)
        response = self.fetch(
            '/user/%i' % TEST_USER_ID,
            method='PUT',
            body=body,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        self.assertEqual(response.code, 200)
        user = json.loads(response.body.decode())['user']
        self.assertEqual(user['firstname'], 'TestTest')
        self.assertEqual(user['wall_thread_id'], wall_thread)
        self.assertEqual(user['photo_thread_id'], photo_thread)
        
    def test3_delete_user(self):
        response = self.fetch(
            '/user/%i?session_id=%s' % (TEST_USER_ID, SESSION_ID),
            method='DELETE'
        )
        response = self.fetch('/user/%i?session_id=%s' % (
                TEST_USER_ID, SESSION_ID
            )
        )
        self.assertEqual(response.code, 404)
        
        
        
        
        
        
        
        
        
