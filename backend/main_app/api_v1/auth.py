#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import time
import json
import logging
import tornado.web
from tornado.web import HTTPError
from tornado.escape import json_decode, json_encode
from ..models.auth import Auth
from ..models.user import User
from ..base_handler import BaseHandler
from cent.core import generate_token, generate_channel_sign


class API_Login(BaseHandler):

    def get(self):
        raise HTTPError(403)

    def post(self):
        '''returns user_id'''
        login = self.get_argument('login').lower()
        password = self.get_argument('password')
        try:
            auth = self.db.query(Auth).filter_by(login=login).first()
            if not auth or not auth.check_password(password):
                raise HTTPError(403)
            self.session['user_id'] = auth.user_id
            self.set_cookie('current_user_id', str(auth.user_id), expires_days=365)
            self.finish(json.dumps({'user_id': auth.user_id}))
        except HTTPError:
            raise
        except:
            logging.debug('unexected error', exc_info=True)
            raise HTTPError(500)


class API_Logout(BaseHandler):
    
    def get(self):
        self.clear_all_cookies()
        self.session.finish()
        self.finish()


class API_CheckEmail(BaseHandler):
    
    def get(self):
        email = self.get_argument('email').lower()
        if not Auth.is_valid_login(email):
            logging.debug('invalid email format ' + email)
            self.set_status(400)
            self.finish(
                json_encode({'error': 'invalid email format'})
            );
            return;
        if self.db.query(Auth).filter_by(login=email).first():
            self.set_status(409)
            self.finish(
                json_encode({'error': 'email is already exists'})
            );
            return;
        self.finish();

class API_Registration(BaseHandler):

    def post(self):
        email = self.get_argument('login').lower()
        password = self.get_argument('password')
        if self.db.query(Auth).filter_by(login=email).first():
            raise HTTPError(409)
        auth = Auth(
            login=email,
            password=password,
            user=User()
        )
        self.db.add(auth)
        self.db.commit()
        self.session['user_id'] = auth.user_id
        self.set_cookie('current_user_id', str(auth.user_id))
        self.finish(json.dumps({'user_id': auth.user_id}))

class API_Auth(BaseHandler):

    def get(self):
        '''
            get auth of current user
        '''
        try:
            user_id = self.session['user_id']
            authenticated = bool(user_id)

            reb_value = {
                'user_id': user_id,
                'authenticated': authenticated,
            }
            if authenticated:
                now = str(int(time.time()))
                user = str(user_id)
                reb_value['wss'] = {
                    'user': user,
                    'timestamp': now,
                    'token': generate_token('secret', user, now),
                }
            self.finish(json.dumps(reb_value))
        except HTTPError:
            raise
        except:
            logging.debug('unexected error', exc_info=True)
            raise HTTPError(500)


class API_AuthCentrifugo(BaseHandler):

    def post(self):
        '''
        get auth for centrifuge
        '''
        try:
            data = json.loads(self.request.body)
        except ValueError:
            raise tornado.web.HTTPError(403)

        client = data.get("client", "")
        channels = data.get("channels", [])

        to_return = {}

        for channel in channels:
            if channel == '$private_{}'.format(self.current_user):
                sign = generate_channel_sign('secret', client, channel,)
                to_return[channel] = {
                    "sign": sign,
                }
            else:
                raise tornado.web.HTTPError(403)

        self.set_header('Content-Type', 'application/json; charset="utf-8"')
        self.write(json.dumps(to_return))