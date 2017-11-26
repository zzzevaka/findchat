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

    async def single_reader(self):
        while await self.mpsc.wait_message():
            sender, message = await self.mpsc.get()
            self.write_message(message)
            logging.debug("Got message %s from %s" % (message, sender.name))

    def start_reader(self):
        return asyncio.ensure_future(self.single_reader())

    @tornado.gen.coroutine
    def open(self):
        logging.debug('opening ws connection with %s' % self.request.remote_ip)
        self.mpsc = Receiver()
        self.redis_conn = yield self.redis_pool.acquire()
        self.reader_task = self.start_reader()
        self.user_id = self.get_cookie('current_user_id', None)
        if self.user_id:
            # yield self.redis_conn.subscribe(
            #     self.mpsc.channel('updates:user:%i' % int(self.user_id))
            # )
            yield self.redis_conn.execute_pubsub(
                'subscribe', 'updates:user:%i' % int(self.user_id)
            )
        logging.debug('opend ws')

    @tornado.gen.coroutine
    def on_close(self):
        yield self.redis_pool.release(self.redis_conn)
        self.mpsc.stop()

    @tornado.gen.coroutine
    def on_message(self, msg):
        logging.debug(json.loads(msg)['type'])
        msg = json.loads(msg)
        if msg['type'] == 'subscribe thread':
            yield self.redis_conn.subscribe(
                self.mpsc.channel('updates:thread:%i' % msg['thread_id'])
            )
            logging.debug('subscribed')
        if msg['type'] == 'unsubscribe thread':
            # yield self.redis_conn.unsubscribe(
            #     'updates:thread:%i' % msg['thread_id']
            # )
            yield self.redis_conn.execute_pubsub(
                'unsubscribe', 'updates:thread:%i' % msg['thread_id']
            )