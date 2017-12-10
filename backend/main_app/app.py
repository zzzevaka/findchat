#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import logging
from os.path import join, dirname
from tornado.web import Application, StaticFileHandler
from sqlalchemy.orm import sessionmaker
from tornado.locale import load_translations


from .base_handler import *
from .api_v1.auth import API_Login, API_Logout, API_CheckEmail, API_Registration, API_Auth
from .api_v1.post import API_Post, API_UnreadedPostCount
from .api_v1.user import API_Users, API_User
from .api_v1.threads import API_Threads, API_Chats
from .api_v1.thread import API_Thread, API_ThreadChatOffers
from .api_v1.post_like import API_PostLike, API_PostLikeBrief
from .api_v1.ws_handler import WSUpdates
from .api_v1.search import API_SearchUsers
from .api_v1.thread import API_ThreadPeople
from .api_v1.image import API_Image
from .api_v1.language import API_Language

from .auth.google import GoogleOAuth2Handler

class MainApp(Application):
    
    def __init__(self, db_engine, redis, redis_pool=None, **kwargs):
        # routes
        routes = [
            (r'/auth/google', GoogleOAuth2Handler),
            (r'/registration', API_Registration),
            (r'/login', API_Login),
            (r'/logout', API_Logout),
            (r'/auth', API_Auth),
            (r'/threads', API_Threads),
            (r'/chats', API_Chats),
            (r'/thread', API_Thread),
            (r'/thread/([0-9]+)', API_Thread),
            (r'/thread/chat_offers', API_ThreadChatOffers),
            (r'/users', API_Users),
            (r'/user', API_User),
            (r'/image', API_Image),
            (r'/user/([0-9]+)', API_User),
            (r'/post', API_Post),
            (r'/post/([0-9]+)', API_Post),
            (r'/post_likes/([0-9]+)', API_PostLike),
            (r'/post_likes_brief', API_PostLikeBrief),
            (r'/', MainHandler),
            # (r'/login', LoginHandler),
            (r'/ws', WSUpdates),
            # (r'/chat_offers', API_ChatOffer),
            # (r'/chat_offers/([0-9]+)', API_ChatOffer),
            # (r'/chat_offer_join/([0-9]+)', API_ReplyChatOffer),
            (r'/search/users', API_SearchUsers),
            (r'/thread/search_users', API_ThreadPeople),
            # (r'/search/chat_offers', API_SearchChatOffers),
            (r'/unreaded_posts', API_UnreadedPostCount),
            (r'/unreaded_posts/([0-9]+)', API_UnreadedPostCount),
            (r'/check_email', API_CheckEmail),
            (r'/language', API_Language),
            #~ (r'/logout', LogoutHandler),
            #~ (r'/new_person', NewPersonHandler),
            #~ (r'/edit_person', EditPersonHandler),
            #~ (r'/photo_upload', PhotoUploadHandler),
            #~ (r'/about_edit', AboutEditHandler),
            #~ (r'/chat', ChatMainHandler),
            #~ (r"/chatsocket", ChatSocketHandler),
            (r"/(.*)", StaticFileHandler, {"path": '/htdocs/static'}),
        ]
        load_translations(dirname(__file__))
        kwargs['static_path'] = '/htdocs/static'
        kwargs['template_path'] = '/htdocs'
        #~ kwargs['debug'] = True
        kwargs['login_url'] = '/login'
        kwargs['cookie_secret'] = '1o928kIQ92918ikuqYqiwk'
        self.DBSessionMaker = sessionmaker(db_engine)
        self.redis = redis
        self.redis_pool = redis_pool
        super().__init__(routes, **kwargs)
