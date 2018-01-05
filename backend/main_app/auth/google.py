#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import logging
import functools
import tornado.web
import tornado.gen
import tornado.auth
import tornado.escape
from sqlalchemy.orm import joinedload
from ..models.auth import GoogleOAuth2, FacebookOAuth2, VKOAuth2, Auth
from ..models.user import User
from ..base_handler import BaseHandler


GOOGLE_OAUTH_KEY = '1094125325491-q218o10gg8u5t1um8uu5n0pp5lbdl67n.apps.googleusercontent.com'
TOKEN_URI = 'https://accounts.google.com/o/oauth2/token'


class BaseAuthHandler(BaseHandler):
    
    def auth_by_user_id(self, user_id):
        is_new = False
        # find auth by id
        auth = self.db.query(Auth).\
            join(self._AUTH_MODEL).\
            filter(self._AUTH_MODEL.user_id == user_id).\
            first()
        # if auth wasn't find create new auth and user
        if not auth:
            side_auth = self._AUTH_MODEL(
                user_id=user_id,
                auth=Auth(user=User(), password='123')
            )
            self.db.add(side_auth)
            self.db.commit()
            auth = side_auth.auth
            is_new = True
        # set session and cookies info
        self.session['user_id'] = auth.user_id
        self.set_cookie(
            'current_user_id',
            str(auth.user_id),
            expires_days=365
        )
        if is_new:
            self.redirect('/edit_user')
        else:
            self.redirect('/user/%i' % auth.user_id)

class GoogleOAuth2Handler(BaseAuthHandler,
                          tornado.auth.GoogleOAuth2Mixin):
    
    _AUTH_MODEL = GoogleOAuth2
    _REDIRECT_URI = 'https://findchat.io/auth/google'

    @tornado.gen.coroutine
    def get_authenticated_user_id(self):
        '''
            get user's identificator from oauth2
        '''
        access = yield self.get_authenticated_user(
            redirect_uri=self._REDIRECT_URI,
            code=self.get_argument('code')
        )
        oauth2_user = yield self.oauth2_request(
            self._OAUTH_USERINFO_URL,
            access_token=access["access_token"]
        )
        if 'id' in oauth2_user:
            return oauth2_user['id']
        else:
            raise tornado.web.HTTPError(403)

    @tornado.gen.coroutine
    def get(self):
        try:
            is_new = False
            if self.get_argument('code', False):
                # get oauth2 user's id
                oauth2_user_id = yield self.get_authenticated_user_id()
                self.auth_by_user_id(oauth2_user_id)
            else:
                # redirect to oauth2 provider page
                yield self.authorize_redirect(
                    redirect_uri=self._REDIRECT_URI,
                    client_id=GOOGLE_OAUTH_KEY,
                    scope=['profile', 'email'],
                    response_type='code',
                    extra_params={'approval_prompt': 'auto'}
                )
        except:
            logging.error(
                'fatal error:\n Request info:\n%s\narguments: %s\n' %\
                    (self.request, self.request.arguments),
                exc_info=True
            )
            raise


class FacebookOAuth2Handler(BaseAuthHandler,
                            tornado.auth.FacebookGraphMixin):

    _AUTH_MODEL = FacebookOAuth2
    _REDIRECT_URI = 'https://findchat.io/auth/facebook'

    @tornado.gen.coroutine
    def get(self):
        try:
            if self.get_argument('code', False):
                oauth2_user = yield self.get_authenticated_user(
                    redirect_uri=self._REDIRECT_URI,
                    client_id=self.settings['facebook_oauth']['key'],
                    client_secret=self.settings['facebook_oauth']['secret'],
                    code=self.get_argument("code")
                )
                self.auth_by_user_id(str(oauth2_user['id']))
            else:
                yield self.authorize_redirect(
                    redirect_uri=self._REDIRECT_URI,
                    client_id='230915264114582',
                    # extra_params={"scope": "read_stream,offline_access"}
                )
        except:
            logging.error(
                'fatal error:\n Request info:\n%s\narguments: %s\n' %\
                    (self.request, self.request.arguments),
                exc_info=True
            )
            raise


class VKOAuth2Handler(BaseAuthHandler,
                      tornado.auth.OAuth2Mixin):

    _AUTH_MODEL = VKOAuth2
    _OAUTH_ACCESS_TOKEN_URL = 'https://oauth.vk.com/access_token?'
    _OAUTH_AUTHORIZE_URL = 'https://oauth.vk.com/authorize?'
    _REDIRECT_URI = 'https://findchat.io/auth/vk'
    _OAUTH_NO_CALLBACKS = False

    @tornado.gen.coroutine
    def get(self):
        try:
            if self.get_argument('code', False):
                oauth2_user = yield self.get_authenticated_user(
                    redirect_uri=self._REDIRECT_URI,
                    client_id=self.settings['vk_oauth']['key'],
                    client_secret=self.settings['vk_oauth']['secret'],
                    code=self.get_argument("code")
                )
                logging.debug(oauth2_user)
                self.auth_by_user_id(str(oauth2_user['user_id']))
            else:
                yield self.authorize_redirect(
                    redirect_uri=self._REDIRECT_URI,
                    client_id='6296091',
                )
        except:
            logging.error(
                'fatal error:\n Request info:\n%s\narguments: %s\n' %\
                    (self.request, self.request.arguments),
                exc_info=True
            )
            raise

    @tornado.auth._auth_return_future
    def get_authenticated_user(self, redirect_uri, client_id, client_secret,
                               code, callback, extra_fields=None):
        http = self.get_auth_http_client()
        args = {
            "redirect_uri": redirect_uri,
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
        }
        http.fetch(
            self._oauth_request_token_url(**args),
            functools.partial(self._on_access_token, callback),
        )

    def _on_access_token(self, future, response):
        if response.error:
            future.set_exception(tornado.auth.AuthError('VK auth error: %s' % str(response)))
        
        args = tornado.escape.json_decode(response.body)
        future.set_result(args)
