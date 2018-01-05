#!/usr/bin.en python3

import sys

PREFIX = '/app'
sys.path.append(PREFIX)

from datetime import datetime

from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from redis import StrictRedis
from tornado.testing import AsyncHTTPTestCase

import settings
from main_app.app import MainApp
from main_app.models.auth import Auth
from main_app.models.user import User, DEFAULT_USER_ID
from main_app.models.thread import PostThread, User2Thread
from main_app.base_handler import BaseHandler

PASSWORD = '123'

class TornadoBaseTestCase(AsyncHTTPTestCase):
    
    @classmethod
    def setUpClass(cls):
        '''
            - init SQLAlchemy session
            - create User for this testcase
            - rewrite BaseHandler.get_current_user
        '''
        cls.db = sessionmaker(cls.get_db_engine())()
        # create user
        cls.current_user = User(firstname=cls.__name__)
        cls.auth = Auth(
            login=cls.__name__.lower(),
            password=PASSWORD,
            user=cls.current_user
        )
        cls.db.add(cls.auth)
        cls.db.commit()
        
        BaseHandler.get_current_user = lambda x: cls.current_user.id
        
    @classmethod
    def tearDownClass(cls):
        cls.db.close()
        
    def get_app(self):
        return MainApp(
            self.get_db_engine(),
            self.get_redis_conn(),
            debug=False
        )

    @classmethod
    def get_db_engine(cls):
        if not hasattr(cls, 'engine'):
            cls.engine = create_engine(
                'postgresql://%s:%s@%s/%s' % (
                    settings.unittest['db']['username'],
                    settings.unittest['db']['password'],
                    settings.unittest['db']['host'],
                    settings.unittest['db']['dbname'],
                )
            )
        return cls.engine

    @classmethod
    def get_redis_conn(cls):
        if not hasattr(cls, 'redis_conn'):
            cls.redis_conn = StrictRedis(
                host=settings.unittest['redis']['host'],
                port=settings.unittest['redis']['port'],
            )
        return cls.redis_conn