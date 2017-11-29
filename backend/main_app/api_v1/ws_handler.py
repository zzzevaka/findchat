#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import asyncio
import json
import logging
import tornado.websocket
import tornado.gen

from ..lib.redis_session import Session
from aioredis.pubsub import Receiver


class WSUpdates(tornado.websocket.WebSocketHandler):
    
    @property
    def redis_pool(self):
        return self.application.redis_pool

    def check_origin(self, origin):
        return True

    @tornado.gen.coroutine
    def reader(self, channel):
        logging.debug('start reader')
        while (yield channel.wait_message()):
            msg = yield channel.get(encoding='utf-8')
            self.write_message(msg)
        logging.debug('stop reader')
        
    @tornado.gen.coroutine
    def open(self):
        logging.debug('opend ws')
        self.conn = yield self.redis_pool.acquire()
        self.user_id = self.get_cookie('current_user_id', None)
        if not self.user_id:
            return
        self.ch_name = 'updates:user:%i' % int(self.user_id)
        yield self.conn.execute_pubsub('subscribe', self.ch_name)
        channel = self.conn.pubsub_channels[self.ch_name]
        yield self.reader(channel)

    @tornado.gen.coroutine
    def on_close(self):
        logging.debug('!!!!!!!!!! WS CLOSED !!!!!!!!!!!!!!!')
        (yield self.conn.execute_pubsub('unsubscribe', self.ch_name))
        self.redis_pool.release(self.conn)

    @tornado.gen.coroutine
    def on_message(self, message):
        logging.debug(message)
        self.write_message(u"You said: " + message)

    def on_ping(self):
        logging.debug('ping request')
    
    def on_pong(self):
        logging.debug('ping response')