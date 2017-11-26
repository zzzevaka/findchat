#!/usr/bin.en python3

from datetime import datetime

from tornado.testing import AsyncHTTPTestCase

import __main__ as main
from ..app import MainApp
from ..models.auth import Auth
from ..models.user import User, DEFAULT_USER_ID
from ..models.thread import PostThread, User2Thread
from ..base_handler import BaseHandler

PASSWORD = '123'

class TornadoBaseTestCase(AsyncHTTPTestCase):
    
    @classmethod
    def setUpClass(cls):
        '''
            - init SQLAlchemy session
            - create User for this testcase
            - rewrite BaseHandler.get_current_user
        '''
        cls.db = main.SessionMaker()
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
        return MainApp(main.db_engine, main.redis_conn, debug=False)
        
        
