#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
from collections import OrderedDict

from sqlalchemy import and_, func
from sqlalchemy.orm import joinedload

import tornado.web
from ..base_handler import BaseHandler

from ..models.user import User
# from ..models.chat_offer import ChatOffer, AnswerChatOffer
from ..models.language import Language
from ..models.hashtag import Hashtag

from ..models.basemodel import alchemy_encoder


# FRO DEV
import logging
    

class API_SearchUsers(BaseHandler):

    def post(self):
        try:
            filter = json.loads(self.get_argument('filter'))
            query = self.db.query(User, func.count().label('total'))
            if ('lang' in filter and filter['lang']):
                query = query.join(User.languages).filter(
                    Language.name.in_(filter['lang'])
                )
            if ('tags' in filter and filter['tags']):
                query = query.join(User.hashtags).filter(
                    Hashtag.name.in_(filter['tags'])
                )
            query = query.group_by(User.id)
            query = query.order_by('total DESC');
            if ('limit' in filter and filter['limit']):
                query = query.limit(filter['limit'])
            if ('offset' in filter and filter['offset']):
                query = query.offset(filter['offset'])
            result = query.all()
            users = OrderedDict()
            for user,cnt in result:
                users[user.id] = user.export_dict
            users_jsoined = json.dumps(
                users,
                cls=alchemy_encoder(),
                check_circular=False
            )
            self.finish(users_jsoined)
        except tornado.web.HTTPError:
            raise
        except:
            logging.error(
                'fatal error:\n Request info:\n%s\narguments: %s\n' %\
                    (self.request, self.request.arguments),
                exc_info=True
            )