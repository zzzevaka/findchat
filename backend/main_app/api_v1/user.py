#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import logging

import json
from datetime import datetime

from main_app.utils.email import email

import tornado.web

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload

from ..models.basemodel import STRFTIME_FORMAT, alchemy_encoder
from ..models.user import User, DEFAULT_USER_ID
from ..models.thread import PostThread, User2Thread
from ..models.language import Language

from ..base_handler import BaseHandler

# FRO DEV
import logging


class API_Users(BaseHandler):

    def get(self):
        '''
            get users by id

            example: GET /users?id=1,2,3,4

            return code and body:
                codes:
                    200 - normal
                    409 - incorrect arguments
                body:
                    users: {
                        ...jsoined users
                    }
        '''
        users_id = self.get_argument('id').split(',')
        try:
            users_id = [int(i) for i in users_id]
        except ValuerError:
            raise tornado.web.HTTPError(409)
        query = self.db.query(
                User
            ).options(
                joinedload(User._languages)
            ).filter(User.id.in_(users_id))
        result = query.all()
        for_export = {
            'users': {}
        }
        for u in result:
            for_export['users'][u.id] = u.export_dict
            for_export['users'][u.id]['lang'] = [l.name for l in u._languages]
            for_export['users'][u.id]['age'] = u.age
        for_export = json.dumps(
            for_export,
            cls=alchemy_encoder(),
            check_circular=False
        )
        self.finish(for_export)


class API_User(BaseHandler):

    def post(self):
        '''new user'''
        arg_user = self.get_argument('user')
        try:
            arg_user = json.loads(arg_user)
            # create user
            user = User(
                firstname=str(arg_user['firstname']),
                birth_date=datetime.strptime(
                    arg_user['birth_date'], STRFTIME_FORMAT
                )
            )
        except:
            raise tornado.web.HTTPError(409)
        try:
            # create wall thread
            user.wall_thread = PostThread()
            user.wall_thread.user2thread.append(
                User2Thread(user_id=DEFAULT_USER_ID)
            )
            user.wall_thread.user2thread.append(
                User2Thread(user=user)
            )
            # create photo thread
            user.photo_thread = PostThread()
            user.photo_thread.user2thread.append(
                User2Thread(user_id=DEFAULT_USER_ID)
            )
            user.photo_thread.user2thread.append(
                User2Thread(user=user)
            )
            self.db.add(user)
            self.db.commit()
            self.session['user_id'] = user.id
            self.finish({'user_id': user.id})
        except IndentationError:
            if 'email' in str(err.__cause__):
                msg = 'this email has been already registered'
                raise tofnado.web.HTTPError(
                    409, 'this email has been already registered'
                )
            else:
                logging.error('An error has occured', exc_info=True)
                raise tornado.web.HTTPError(500)


    def put(self, id):
        '''edit user'''
        arg_user = self.get_argument('user')
        try:
            arg_user = json.loads(arg_user)
            # check the permissons
            if id != self.current_user:
                pass
                # self.set_status(403)
                # self.finish()
                # return
            user = self.db.query(User).filter_by(id=id).first()
            for key in user.editable_by_api:
                if key in arg_user and arg_user[key] is not None:
                    setattr(user, key, arg_user[key])
                    if key is 'avatar_id':
                        user.thumbnail = user.avatar.content.preview
                    if key is 'lang':
                        langs = Language.get_languages_from_db(
                            arg_user[key], self.db
                        )
                        user.update_languages(langs)
            jsoined = json.dumps(
                dict(
                    users={
                        id: {**user.export_dict, 'age': user.age}
                    },
                ),
                cls=alchemy_encoder(),
                check_circular=False,
            )
            self.db.commit()
            self.finish(jsoined)
            self.redis.publish('updates:user:%i' % int(id), jsoined)
        except:
            logging.error('An error has occured', exc_info=True)
            raise tornado.web.HTTPError(500)