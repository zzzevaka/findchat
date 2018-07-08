#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import logging
from datetime import datetime

import tornado.web

from sqlalchemy import and_
from sqlalchemy.orm import joinedload

from main_app.models.basemodel import STRFTIME_FORMAT, alchemy_encoder
from main_app.models.user import User, FollowUser, DEFAULT_USER_ID
from main_app.models.thread import PostThread, User2Thread
from main_app.models.language import Language
from main_app.models.hashtag import Hashtag

from ..base_handler import BaseHandler

from main_app.celery_app import task_search_index


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
                User, FollowUser.dst_user_id
            ).outerjoin(
                FollowUser,
                and_(
                    User.id == FollowUser.dst_user_id,
                    FollowUser.src_user_id == self.current_user,
                    FollowUser.is_current()
                )
            ).options(
                joinedload(User._languages)
            ).filter(User.id.in_(users_id))
        result = query.all()
        for_export = {
            'users': {}
        }
        for (u, current_user_follows) in result:
            for_export['users'][u.id] = {
                'lang': [l.name for l in u._languages],
                'age': u.age,
                'current_user_follows': bool(current_user_follows),
                **u.export_dict
            }
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
            if int(id) != self.current_user:
                self.set_status(403)
                self.finish()
                return
            user = self.db.query(User).filter_by(id=id).first()
            for key in user.editable_by_api:
                if key in arg_user and arg_user[key] is not None:
                    setattr(user, key, arg_user[key])
                    if key is 'avatar_id':
                        user.thumbnail = user.avatar.content.preview
                    elif key is 'lang':
                        langs = Language.get_languages_from_db(
                            arg_user[key], self.db
                        )
                        user.update_languages(langs)
                    elif key is 'about':
                        # create hashtags
                        hashtags = Hashtag.get_hashtags_from_string(
                            arg_user[key],
                            self.db
                        )
                        user.hashtags = hashtags
                        # for h in hashtags:
                        #     user.hashtags.append(h)

            for_export = {
                'users': {
                    id: {**user.export_dict, 'age': user.age}
                },
            }
            jsoined = json.dumps(
                for_export,
                cls=alchemy_encoder(),
                check_circular=False,
            )
            self.db.commit()
            self.finish(jsoined)

            # TODO дублирование данных: отправляем новые данные в HTTP ответе и WS.
            # TODO. WS хотелось бы сохранить, т.к. пользователь может открыть
            # TODO в нескольких вкладках


            centrifuge_cmd = {
                'method': 'publish',
                'params': {
                    'channel': '$private_{}'.format(user.id),
                    'data': for_export,
                }
            }
            self.redis.rpush(
                "centrifugo.api",
                json.dumps(
                    centrifuge_cmd,
                    cls=alchemy_encoder(),
                    check_circular=False,
                )
            )
            task_search_index.delay(
                doc_type='user', id=id, body=user.get_search_index()
            )
        except:
            logging.error('An error has occured', exc_info=True)
            raise tornado.web.HTTPError(500)