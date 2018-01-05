#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import logging

import tornado.web
from sqlalchemy import and_
from sqlalchemy.orm import aliased

from ..base_handler import BaseHandler
from ..models.basemodel import alchemy_encoder
from ..models.user import FollowUser, User



class API_UserFollowing(BaseHandler):
    
    def get(self, user_id):
        '''
            Get users user_id is following by

            Parameters
            ----------
                limit: int
                    how many users load
                offset: int
                    how many users offset

            Returns
            ----------

            CODES:
                200: OK
                400: incorrect arguments

            BODY:
                JSON: {
                    users_id: [ids, ],
                    users: {
                        ...users
                    } 
                }
        '''
        try:
            limit = int(self.get_argument('limit', 0)) or None
            offset = int(self.get_argument('offset', 0)) or None
        except ValueError:
            raise tornado.web.HTTPError(400)
        t_id = 'user_following_%i' % int(user_id)
        for_export = {
            'threads': {
                t_id: {
                    'id': t_id,
                    'posts': []
                }
            },
            'posts': {},
            'users': {},
        }
        t2 = aliased(FollowUser, name='t2')
        query = self.db.query(User, t2.src_user_id).\
                    join(FollowUser, User.id == FollowUser.dst_user_id).\
                    outerjoin(
                        t2,
                        and_(
                            FollowUser.dst_user_id == t2.dst_user_id,
                            t2.src_user_id == self.current_user,
                            t2.is_current()
                        )
                    ).\
                    filter(FollowUser.src_user_id == user_id).\
                    filter(FollowUser.is_current()).\
                    filter(User.is_current()).\
                    offset(offset).limit(limit)
        result = query.all()
        if not limit or len(result) < limit:
            for_export['threads'][t_id]['no_more_posts'] = True
        else:
            for_export['threads'][t_id]['no_more_posts'] = False
        for (u, current_user_follows) in result:
            for_export['threads'][t_id]['posts'].append(u.id)
            for_export['users'][u.id] = {
                'current_user_follows': bool(current_user_follows),
                **u.export_dict
            }
        self.finish(json.dumps(
            for_export,
            cls=alchemy_encoder(),
            check_circular=False
        ))


class API_UserFollowers(BaseHandler):

    def get(self, user_id):
        '''
            Get user followers

            Parameters
            ----------
                limit: int
                    how many users load
                offset: int
                    how many users offset
            Returns
            ----------

            CODES:
                200: OK
                400: incorrect arguments

            BODY:
                JSON: {
                    users_id: [ids, ],
                    users: {
                        ...users
                    } 
                }
        '''
        try:
            limit = int(self.get_argument('limit', 0)) or None
            offset = int(self.get_argument('offset', 0)) or None
        except ValueError:
            raise tornado.web.HTTPError(400)
        t_id = 'user_followers_%i' % int(user_id)
        for_export = {
            'threads': {
                t_id: {
                    'id': t_id,
                    'posts': []
                }
            },
            'posts': {},
            'users': {},
        }
        t2 = aliased(FollowUser, name='t2')
        query = self.db.query(User, t2.src_user_id).\
                    join(FollowUser, User.id == FollowUser.src_user_id).\
                    outerjoin(
                        t2,
                        and_(
                            FollowUser.src_user_id == t2.dst_user_id,
                            t2.src_user_id == self.current_user,
                            t2.is_current()
                        )
                    ).\
                    filter(FollowUser.dst_user_id == user_id).\
                    filter(FollowUser.is_current()).\
                    filter(User.is_current()).\
                    offset(offset).limit(limit)
        result = query.all()
        if not limit or len(result) < limit:
            for_export['threads'][t_id]['no_more_posts'] = True
        else:
            for_export['threads'][t_id]['no_more_posts'] = False
        for (u, current_user_follows) in result:
            for_export['threads'][t_id]['posts'].append(u.id)
            for_export['users'][u.id] = {
                'current_user_follows': bool(current_user_follows),
                **u.export_dict
            }
        self.finish(json.dumps(
            for_export,
            cls=alchemy_encoder(),
            check_circular=False
        ))

class API_FollowUser(BaseHandler):

    @tornado.web.authenticated
    def post(self, user_id):
        '''
            start following user

            Parameters
            ----------
            dst_user_id: int (required)

            Returns
            ----------
            CODES:
                200: OK
                409: already subscribed
            
            BODY: empty
        '''
        # get info from table follow_users
        follow_user = self.db.query(FollowUser).\
                    filter_by(src_user_id=self.current_user).\
                    filter_by(dst_user_id=user_id).\
                    filter(FollowUser.is_current()).first()
        # if something found current_user is already
        # subscribed on dst_user_id
        if follow_user:
            self.set_status(409)
        # if nothing found create new relation
        else:
            self.db.add(FollowUser(
                src_user_id=self.current_user,
                dst_user_id=user_id
            ))
        self.db.commit()
        self.finish()

    @tornado.web.authenticated
    def delete(self, user_id):
        '''
            stop following user

            Parameters
            ----------
            dst_user_id: int (required)

            Returns
            ----------
            CODES:
                200: OK
                404: current_user isn't subscribed on dst_user_id

            BODY: empty
        '''
        # get info from table follow_users
        follow_user = self.db.query(FollowUser).\
                    filter_by(src_user_id=self.current_user).\
                    filter_by(dst_user_id=user_id).\
                    filter(FollowUser.is_current()).first()
        # if something found update stop_date
        if follow_user:
            follow_user.stop()
        # nothing found
        else:
            self.set_status(404)
        self.db.commit()
        self.finish()