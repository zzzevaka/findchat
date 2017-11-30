#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
import json
import logging
from datetime import datetime
import tornado.web
from tornado.web import HTTPError
from tornado.escape import json_decode, json_encode
from ..models.auth import Auth
from ..models.user import User
from ..models.thread import PostThread, User2Thread
from ..base_handler import BaseHandler


class API_Login(BaseHandler):

    def get(self):
        # self.write('')
        raise HTTPError(403)
        # self.write('LOGIN PAGE')
        # self.render('index.html')

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

    @tornado.web.authenticated
    def get(self):
        '''
            get auth of current user
        '''
        try:
            password = self.get_argument('password')
            auth = self.db.query(
                    Auth
                ).filter_by(
                    user_id=self.current_user
                ).first()
            # it's an error if auth didn't find by user_id
            # if not auth:
            #     raise ValueError(
            #         "auth didn't find by user_id %s" % self.current_user
            #     )
            if not auth or not auth.check_password(password):
                raise HTTPError(403)
            self.finish(json_encode({'login': auth.login}))
        except HTTPError:
            raise
        except:
            logging.debug('unexected error', exc_info=True)
            raise HTTPError(500)
            

    @tornado.web.authenticated
    def put(self):
        '''
            update auth
            except joisined body.
            example: {
                login: 'new_login@email.com',
                password: 'qwerty'
            }
        '''
        try:
            arg_auth = json_decode(self.request.body)['auth']
            for_export = {}
            logging.debug(
                ("user_id %s\n" % self.current_user) +\
                (repr(self.request) + "\n") +\
                (repr(self.request.body))
            )
            auth = self.db.query(
                    Auth
                ).filter_by(
                    user_id=self.current_user
                ).first()
            # it's an error if auth didn't find by user_id
            if not auth:
                raise ValueError(
                    "auth didn't find by user_id %s" % self.current_user
                )
            for_export['login'] = auth.login
            # change login
            if (
                'login' in arg_auth and
                arg_auth['login'] and
                arg_auth['login'] != auth.login
            ):
                logging.debug('attempt to set new login ' + arg_auth['login'])
                login = arg_auth['login'].lower()
                # check login format
                if not Auth.is_valid_login(login):
                    logging.debug('login format is invalid. Return 400')
                    self.set_status(400)
                    self.finish(
                        json_encode({'error': 'login format is invalid'})
                    )
                    return
                # login format is ok
                # check if login is available
                if self.db.query(Auth).filter_by(login=login).first():
                    logging.debug('login already exists. Return 409')
                    self.set_status(409)
                    self.finish(
                        json_encode({'error': 'login already exists'})
                    )
                    return
                # login is available
                # update login
                auth.login = login
                for_export['login'] = login
                logging.debug('login changed')
            # change password
            if (
                'password' in arg_auth and
                arg_auth['password'] and
                not auth.check_password(arg_auth['password'])
            ):
                logging.debug('attempt to change password')
                # check password format
                if not Auth.is_valid_password(arg_auth['password']):
                    logging.debug('password format is invalid')
                    self.set_status(409)
                    self.finish(
                        json_encode({'error': 'password format is invalid'})
                    )
                    return
                # password format is ok
                # update password
                auth.password = Auth.get_hash(arg_auth['password'])
            self.db.commit()
            logging.debug('commited')
            self.finish(json_encode(for_export))
        except HTTPError:
            raise
        except:
            logging.debug('unexected error', exc_info=True)
            raise HTTPError(500)