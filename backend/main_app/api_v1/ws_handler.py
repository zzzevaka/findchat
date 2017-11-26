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
        conn = yield self.redis_pool.acquire()
        user_id = self.get_cookie('current_user_id', None)
        if not user_id:
            return
        try:
            ch_name = 'updates:user:%i' % int(user_id)
            yield conn.execute_pubsub('subscribe', ch_name)
            channel = conn.pubsub_channels[ch_name]
            yield self.reader(channel)
            yield conn.execute_pubsub('unsubscribe', ch_name)
        finally:
            self.redis_pool.release(conn)