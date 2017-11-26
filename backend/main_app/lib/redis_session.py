#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import time
import json
import uuid
import hashlib
import logging

import tornado.web


class SessionError(Exception):
    pass


class Session():
    '''simpe session handler'''

    def __init__(
                self,
                redis_conn,
                sid=None,
                expire=180,
                hash_salt='',
                lock=True):
        self.redis = redis_conn
        self.hash_salt = hash_salt or ''
        self.new_session_flag = 0
        self.finish_flag = 0
        self.sid = None
        self.sid_hash = None
        self.expire = expire
        self._old_data = {}
        self._new_data = {}
        # if sid was specified
        if sid:
            logging.debug('sid defined: %s' % sid)
            self.sid = sid
            self.sid_hash = self.get_hash(self.sid+self.hash_salt)
            if self.is_locked():
                raise SessionError('a session %s has been alreay locked' %
                    self.sid)
            # is this session exist
            if not self.is_exist():
                self.sid = self.sid_hash = None
        # if self.sid wasn't defined - it's a new session
        if not self.sid:
            self.sid = str(uuid.uuid4())
            self.sid_hash = self.get_hash(self.sid+self.hash_salt)
            self.new_session_flag = 1
            logging.debug('new session: %s' % self.sid)
        if lock:
            if not self.lock():
                raise SessionError('a session %s has been alreay locked' %
                    self.sid)
        if not self.is_new():
            self.load()

    @property
    def data(self):
        return self._old_data

    @property
    def redis_key(self):
        return 'session:user:%s' % self.sid_hash

    @property
    def redis_lock_key(self):
        return 'session:lock:%s' % self.sid_hash

    def get_hash(self, string):
        md5 = hashlib.md5()
        md5.update(string.encode('utf-8'))
        logging.debug("%s > %s" % (string, md5.hexdigest()))
        return md5.hexdigest()

    def is_exist(self):
        return self.redis.exists(self.redis_key)

    def is_locked(self):
        return self.redis.exists(self.redis_lock_key)

    def save(self, unlock=True):
        '''sync session info to the redis'''
        if unlock:
            self.unlock()
        if self.finish_flag:
            return self.redis.delete(self.redis_key)
        if self._old_data == self._new_data and self._new_data:
            return self.redis.expire(self.redis_key, self.expire)
        else:
            serialize = json.dumps(self._new_data)
            return self.redis.setex(
                self.redis_key,
                self.expire,
                serialize)

    def load(self):
        serialize = self.redis.get(self.redis_key)
        if type(serialize) == bytes:
            serialize = serialize.decode()
        self._old_data = json.loads(serialize) if serialize else {}
        self._new_data = self._old_data.copy()
        return 1

    def lock(self, ttl=15):
        '''
            set lock on a session.
            ttl - max lock time
        '''
        if not self.redis.get(self.redis_lock_key):
            logging.debug(self.redis_lock_key)
            return self.redis.setex(self.redis_lock_key, ttl, 1)

    def unlock(self):
        '''set unlock on session'''
        return self.redis.delete(self.redis_lock_key)

    def is_new(self):
        return self.new_session_flag

    def expire(self, ttl):
        self.expire = expire
        return 1

    def finish(self):
        self.finish_flag = 1
        return self.save(unlock=True)

    def is_finished(self):
        return self.finish_flag

    def __getitem__(self, key):
        if key in self._new_data:
            return self._new_data[key]
        else:
            return

    def __setitem__(self, key, value):
        if type(value) == bytes:
            value = value.decode()
        self._new_data[key] = value
        return 1


class SessionHandler(object):

    def prepare(self):
        '''initiate and lock session'''
        try:
            logging.debug('!!!!!!!!!!!!!!!START PREPARE!!!!!!!!!!!!!!!!!')
            # get session_id from an argument or cookies
            session_id = self.get_argument('session_id', None) or \
                self.get_secure_cookie('session_id', None)
            if session_id and type(session_id is bytes):
                session_id = session_id.decode()
            logging.debug('session_id = %s' % session_id)
            # init a Session
            self.session = Session(
                self.redis,
                session_id,
                expire=86400*183,
                hash_salt='')
            logging.debug('session %s locked' % self.session.sid)
            self.set_secure_cookie('session_id', self.session.sid)
        except:
            logging.error("An error has occured", exc_info=True)
            self.clear_cookie('session_id')
            raise
        finally:
            logging.debug(self.session['user_id'])
            logging.debug('!!!!!!!!!!!!!!!END PREPARE!!!!!!!!!!!!!!!!!')

    def on_finish(self):
        '''push session info to the cache and unlock'''
        try:
            logging.debug('!!!!!!!!!!!!!!!START FINISH!!!!!!!!!!!!!!!!!')
            if not hasattr(self, 'session'):
                logging.debug("an attribute 'session' wasn't found")
                return
            if self.session.is_finished() or self.session.save():
                logging.debug(
                    'session %s successfully synchronizated' %
                    self.session.sid)
            else:
                logging.error(
                    "a synchronization of session %s failed" %
                    self.session.sid)
        except:
            logging.error("An error has occured", exc_info=True)
            raise
        finally:
            logging.debug('!!!!!!!!!!!!!!!END FINISH!!!!!!!!!!!!!!!!!')
