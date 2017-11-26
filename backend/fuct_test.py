#!/usr/bin/env python3

import unittest
from unittest import TestSuite

from redis import StrictRedis

from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

#~ from main_app.tests.model_user_test import *
#~ from main_app.tests.model_post_test import *
#~ from main_app.tests.model_thread_test import *
#~ 
#~ from main_app.tests.api_user_test import *
#~ from main_app.tests.api_post_test import *
from main_app.models.user import *
from main_app.models.thread import *
from main_app.models.post import *

from main_app.models.basemodel import BaseModel

import settings

def load_tests(loader, tests, pattern):
    suite = TestSuite()
    for test_class in (
            ModelUserTestCase,
            ModelPostTestCase,
            ModelThreadTestCase,
            APIUsersTestCase,
            APIUserTestCase,
            APIPostTestCase,
            ):
        tests = loader.loadTestsFromTestCase(test_class)
        suite.addTests(tests)
    return suite

logging.basicConfig(level=logging.ERROR)
db_engine = create_engine(
                    'postgresql://%s:%s@%s/%s' % (
                        settings.unittest['db']['username'],
                        settings.unittest['db']['password'],
                        settings.unittest['db']['host'],
                        settings.unittest['db']['dbname'],
                    )
                )
    
redis_conn = StrictRedis(
                host=settings.unittest['redis']['host'],
                port=settings.unittest['redis']['port'],
                password=settings.unittest['redis']['password']
            )

SessionMaker = sessionmaker(db_engine, expire_on_commit=True)
#~ for table in BaseModel.metadata.tables:
    #~ try:
        #~ db_engine.execute('DROP table %s CASCADE' % table)
    #~ except:
        #~ pass
BaseModel.metadata.create_all(db_engine)
s = SessionMaker()
