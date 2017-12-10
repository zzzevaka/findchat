#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import tornado.web
import tornado.gen

GOOGLE_OAUTH_KEY = '1094125325491-q218o10gg8u5t1um8uu5n0pp5lbdl67n.apps.googleusercontent.com'
TOKEN_URI = 'https://accounts.google.com/o/oauth2/token'


class GoogleOAuth2Handler(tornado.web.RequestHandler,
                          tornado.auth.GoogleOAuth2Mixin):
    
    @tornado.gen.coroutine
    def get(self):
        if self.get_argument(code, False):
            user = yield self.get_authenticated_user(
                redirect_uri=TOKEN_URI,
                code=self.get_argument('code')
            )
        else:
            yield self.authorize_redirect(
                redirect_uri='http://your.site.com/auth/google',
                client_id=GOOGLE_OAUTH_KEY,
                scope=['profile', 'email'],
                response_type='code',
                extra_params={'approval_prompt': 'auto'}
            )

