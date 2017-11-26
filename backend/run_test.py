#!/usr/bin/env python3

import unittest
from datetime import datetime
from unittest import TestSuite

from redis import StrictRedis

from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine


from main_app.tests.model_auth_test import *
from main_app.tests.model_user_test import *
from main_app.tests.model_post_test import *
from main_app.tests.model_thread_test import *
from main_app.tests.model_content_test import *
from main_app.tests.model_post_like_test import *
from main_app.tests.model_hashtag_test import *

from main_app.tests.api_auth_test import *
from main_app.tests.api_users_test import *
from main_app.tests.api_post_test import *
from main_app.tests.api_threads_test import *
from main_app.tests.api_thread_test import *
from main_app.tests.api_post_like_test import *
from main_app.tests.api_language_test import *
# from main_app.tests.api_chat_offer_test import *
# from main_app.tests.api_search_test import *
from main_app.tests.api_image_test import *

from main_app.utils.tests.image_utils_test import *

from main_app.models.basemodel import BaseModel

import settings

from test_data.data import users
from main_app.models.post import Post
from main_app.models.postcontent import ImageContent
from main_app.models.language import Language
from main_app.models.lang_list import languages 


def load_tests(loader, tests, pattern):
    suite = TestSuite()
    for test_class in (
            ImageUtilsTestCase,
            ModelUserTestCase,
            ModelAuthTestCase,
            ModelPostTestCase,
            ModelThreadTestCase,
            ModelContentTestCase,
            ModelPostLikeTestCase,
            ModelHashtagTestCase,
            APIAuthTestCase,
            APIUsersTestCase,
            APIImageTestCase,
            APIPostTestCase,
            APIThreadsTestCase,
            APIThreadTestCase,
            APIPostLikeTestCase,
            APILanguageTestCase,
            APIUnreadedPostCount
        ):
        tests = loader.loadTestsFromTestCase(test_class)
        suite.addTests(tests)
    return suite

if __name__ == '__main__':
    
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
                # password=settings.unittest['redis']['password']
            )

    SessionMaker = sessionmaker(db_engine, expire_on_commit=True)
    for table in BaseModel.metadata.tables:
        try:
            db_engine.execute('DROP table %s CASCADE' % table)
        except:
            pass
    BaseModel.metadata.create_all(db_engine)

    s = SessionMaker()

    # DEFAULT_USER_ID
    s.add(User.get_default())
    s.commit()

    for u in users:
        auth = Auth(
            login=u['login'],
            password='123',
            user=User(firstname=u['name'], birth_date=u['birthdate'])
        )
        s.add(auth)
        s.commit()
        if 'avatar' in u:
            auth.user.photo_thread.posts.append(
                Post(
                    author_id=auth.user.id,
                    text='avatar',
                    content=ImageContent(
                        img=Image.open('test_data/%s' % u['avatar'])
                    )
                )
            )
            auth.user.avatar = auth.user.photo_thread.posts[0]
            auth.user.thumbnail = auth.user.photo_thread.posts[0].content.preview
        s.commit()
    

    for k in sorted(languages.keys()):
        v = languages[k]
        s.add(
            Language(
                name=v['name'],
                native_name=v['native'],
                code=k
            )
        )
    s.commit()



    # run tests
    unittest.main(verbosity=2, warnings='ignore')


