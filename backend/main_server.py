#!/usr/bin/env python
# -*- coding: utf-8 -*-

import asyncio
import logging
import aioredis

from redis import StrictRedis
from sqlalchemy import create_engine
from tornado.httpserver import HTTPServer
from tornado.platform.asyncio import AsyncIOMainLoop

from main_app.app import MainApp

import settings


LOGGING_FMT = u'%(filename)s[LINE:%(lineno)d]# %(levelname)s [%(asctime)s]  %(message)s'

if __name__ == '__main__':
    logging.basicConfig(format=LOGGING_FMT, level=logging.DEBUG)
    # mixin tornado and asyncio
    AsyncIOMainLoop().install()
    loop = asyncio.get_event_loop()
    # databases connections
    db_engine = create_engine(
        'postgresql://%s:%s@%s/%s' % (
            settings.unittest['db']['username'],
            settings.unittest['db']['password'],
            settings.unittest['db']['host'],
            settings.unittest['db']['dbname'],
        ),
        pool_recycle=300
    )
    redis = StrictRedis(
        host=settings.unittest['redis']['host'],
        port=settings.unittest['redis']['port'],
    )
    redis_pool = loop.run_until_complete(aioredis.create_pool(
        (settings.unittest['redis']['host'], settings.unittest['redis']['port']),
        # password=settings.unittest['db']['password'],
        minsize=2, maxsize=1000
    ))
    # create the application and start the HTTP server
    app = MainApp(db_engine, redis, redis_pool=redis_pool, debug=True)
    httpserver = HTTPServer(app)
    httpserver.listen(8080, '0.0.0.0')
    loop.run_forever()
