#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import logging
import json
import tornado.web
from datetime import datetime

from sqlalchemy import and_,or_
from sqlalchemy.orm import joinedload

from ..base_handler import BaseHandler

from ..models.chat_offer import ChatOffer, AnswerChatOffer
from ..models.thread import PostThread, User2Thread, THREAD_TYPE
from ..models.post import Post, POST_TYPE
from ..models.basemodel import alchemy_encoder

from ..models.hashtag import Hashtag, HashTagInterface
from ..models.language import Language


class API_ChatOffer(BaseHandler):
        
    @tornado.web.authenticated
    def post(self):
        '''
            add chat offer
        '''
        arg_offer = None
        offer = None
        for_export = {}

        try:
            arg_offer = json.loads(self.get_argument('chat_offer'))
            # crete offer
            offer = ChatOffer(
                author_id=self.current_user,
                title=arg_offer['title']
            )
            # add hastags
            for tag in HashTagInterface.get_hashtags_from_string(
                    offer.title, self.db
                ):
                offer.hashtags.append(tag)
            # add languages
            for lang in Language.get_languages_from_db(arg_offer['lang'],self.db):
                offer.languages.append(lang)
        except (json.decoder.JSONDecodeError, KeyError):
            raise tornado.web.HTTPError(406)
        try:
            self.db.add(offer)
            self.db.commit()
            self.db.refresh(offer)
            for_export['chat_offers'] = {offer.id: offer.export_dict}
            self.finish(json.dumps(for_export))
        except tornado.web.HTTPError:
            raise
        except:
            logging.error(
                'fatal error:\n Request info:\n%s\narguments: %s\n' %\
                    (self.request, self.request.arguments),
                exc_info=True
            )

    @tornado.web.authenticated
    def get(self):
        '''
            get chat offes
        '''
        limit = self.get_argument('limit', None)
        offset = self.get_argument('offset', None)
        offers = self.db.query(
                ChatOffer
            ).options(
                joinedload('_author')
            ).filter(
                ChatOffer.is_current()
            ).limit(
                limit
            ).offset(
                offset
            ).all()
        for_export = {
            'chat_offers': {},
            'users': {}
        }
        for offer in offers:
            for_export['chat_offers'][offer.id] = offer.export_dict
            for_export['users'][offer._author.id] = offer._author.export_dict
        jsoined = json.dumps(
            for_export, cls=alchemy_encoder(), check_circular=False
        )
        self.finish(
            json.dumps(
                for_export, cls=alchemy_encoder(), check_circular=False
            )
        )

    @tornado.web.authenticated
    def delete(self, offer_id):
        '''
            set stop_date on offer
        '''
        try:
            offer = self.db.query(ChatOffer).filter_by(id=offer_id).first()
            if (
                not offer or
                offer.author_id != self.current_user or
                not offer.is_current()
            ):
                raise tornado.web.HTTPError(406)
            offer.stop()
            self.db.commit()
        except tornado.web.HTTPError:
            raise
        except:
            logging.error(
                'fatal error:\n Request info:\n%s\narguments: %s\n' %\
                    (self.request, self.request.arguments),
                exc_info=True
            )


class API_ReplyChatOffer(BaseHandler):

    @tornado.web.authenticated
    def post(self, offer_id):
        '''
            DEPRECATED

            Creates private thread between self.currrent user and
                chat_offer.author_id

            If the users have a private thread (has been chatting already) just
            updates the thread:
                - refreshs user2thread isinstances if it's needed'
                - adds post (created by offer)

            Example: POST chat_offer_join/3

            Returns:
                threads:{
                    23: {thread.jsoined}
                }
                posts: {
                    435: {post.jsoined}
                }
        '''
        # ChatOffer instance
        offer = None
        # PostThread instance (private chat between users)
        thread = None
        # post whish will be create by offer
        offer_post = None
        for_export = {}

        try:
            user_answered = self.db.query(
                    AnswerChatOffer.offer_id
                ).filter_by(
                    user_id = self.current_user
                ).subquery()

            # get chat_offer instance
            offer = self.db.query(
                    ChatOffer
                ).options(
                    joinedload('_author')
                ).filter(
                    ChatOffer.id == offer_id
                ).filter(
                    ChatOffer.id.notin_(user_answered)
                ).first()
            # return 404 if offer wasn't found
            if not offer:
                raise tornado.web.HTTPError(404)
            thread = PostThread.get_actual_chat(
                users=[self.current_user, offer.author_id],
                session=self.db,
                create=True
            )
            # create Post from offer and add it to the thread
            thread.posts.append(
                ChatOffer.post_from_chat_offer(offer)
            )
            # create answer post
            thread.posts.append(
                Post(author_id=self.current_user, **json.loads(self.get_argument('post')))
            )
            # update uset2thread last_post
            for u2t in thread.user2thread:
                u2t.last_post = thread.posts[-1]
                if u2t.user_id == self.current_user:
                    u2t.last_readed_post = thread.posts[-1]
                else:
                    u2t.last_readed_post = thread.posts[-2]
            # add answer_chat_offer
            offer.answers.append(AnswerChatOffer(user_id = self.current_user))
            # save changes to the DB
            self.db.commit()
            for p in thread.posts:
                p.content
            for_export = {
                'threads': {
                    thread.id: thread.export_dict
                },
                'posts': {
                    p.id: p.export_dict for p in thread.posts
                },
                'unreaded_posts': {
                    'thread_id': thread.id,
                    'count': 1
                },
                'thread_id' : thread.id,
                'offer_author': offer._author.export_dict
            }
            for_export['threads'][thread.id]['posts'] = [p.id for p in thread.posts]
            for_export = json.dumps(
                for_export,
                cls=alchemy_encoder(),
                check_circular=False
            )
            self.finish(for_export)
            self.redis.publish('updates:user:%s' % offer.author_id, for_export)
                
        except tornado.web.HTTPError:
            raise
        except:
            logging.error(
                'fatal error:\n Request info:\n%s\narguments: %s\n' %\
                    (self.request, self.request.arguments),
                exc_info=True
            )