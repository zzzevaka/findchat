#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import logging
import tornado.gen

from ..base_handler import BaseHandler
from ..models.auth import Auth, VKOAuth2
from ..models.user import User


DEV_USER_ID = '234234'


class DevAuthHandler(BaseHandler):

    _AUTH_MODEL = VKOAuth2

    @tornado.gen.coroutine
    def get(self):
        auth = self.db.query(Auth). \
            join(self._AUTH_MODEL). \
            filter(self._AUTH_MODEL.user_id == DEV_USER_ID). \
            first()
        if not auth:
            side_auth = self._AUTH_MODEL(
                user_id=DEV_USER_ID,
                auth=Auth(user=User(), password='123')
            )
            self.db.add(side_auth)
            self.db.commit()
            auth = side_auth.auth
        self.session['user_id'] = auth.user_id
        self.set_cookie(
            'current_user_id',
            str(auth.user_id),
            expires_days=365
        )
