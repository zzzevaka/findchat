#!/usr/bin/env python3

import re
import json
import logging
from datetime import datetime

from .lib.redis_session import SessionHandler

import tornado.web

from sqlalchemy import and_, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import contains_eager

from .models.basemodel import STRFTIME_FORMAT, alchemy_encoder
from .models.user import User, DEFAULT_USER_ID
from .models.post import Post
from .models.thread import PostThread, User2Thread


class BaseHandler(SessionHandler, tornado.web.RequestHandler):
    
    def initialize(self):
        self.db = self.application.DBSessionMaker()
    
    @property
    def redis(self):
        return self.application.redis
    
    def get_current_user(self):
        # if not self.session['user_id']:
        #     self.session['user_id'] = 0
        # return 1
        return self.session['user_id'] or 0

    def get_login_url(self):
        return ''

    def set_default_headers(self):
        '''CORS'''
        self.set_header("Access-Control-Allow-Origin", "http://194.67.144.130:3000")
        self.set_header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT")
        self.set_header("Access-Control-Allow-Credentials", "true")
    
    def on_finish(self):
        self.db.rollback()
        super(BaseHandler, self).on_finish()

    def options(self, *args):
        '''CORS'''
        self.set_header('Access-Control-Request-Method', self.request.headers.get('Access-Control-Request-Method'))
        self.set_header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT")

# class LoginHandler(BaseHandler):
    
#     def get(self):
#         # if self.session['user_id']:
#         #     self.redirect('/')
#         # else:
#         #     self.set_status(403)
#         #     self.render('login.html')
#         # self.redirect('http://194.67.144.130:3000/login')
#         # self.write('HELLO!')
#         self.render('index.html')
        
#     def post(self):
#         email = self.get_argument('email')
#         password = self.get_argument('pwd')
#         user = self.db.query(User).filter_by(_email=email).first()
#         if user is None:
#             self.set_status(409)
#             self.finish("this email isn't registered")
#             return
#         if not user.check_password(password):
#             self.set_status(403)
#             self.finish("incorrect password")
#             return
#         self.session['user_id'] = user.id
#         self.set_cookie('current_user_id', str(user.id))
#         logging.error('success');
#         self.finish()
        

class MainHandler(BaseHandler):
    
    def set_default_headers(self):
        pass

    @tornado.web.authenticated
    def get(self):
        # self.render('index.html')
        # self.redirect('http://194.67.144.130:3000')
        self.write('authenticated')