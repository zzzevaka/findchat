#!/usr/bin/env python3

import logging
from datetime import datetime, MAXYEAR
import unittest

from sqlalchemy.exc import IntegrityError

from ..models.post import Post
from ..models.user import User
from ..models.thread import PostThread

import __main__ as main


class ModelPostTestCase(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        cls.session = main.SessionMaker()
        cls.user = cls.session.query(User).first()
        cls.thread = PostThread()
        cls.session.add(cls.thread)
        cls.session.commit()
            
    @classmethod
    def tearDownClass(cls):
        cls.session.close()
        
    def test11_init_without_arguments(self):
        with self.assertRaises(ValueError):
            p = Post()
            self.session.add(p)
            self.session.commit()
            
    def test12_init_success(self):
        self.session.add(
            Post(
                text='Hello, my friend!',
                author_id=self.user.id,
                thread_id=self.thread.id
            )
        )
        self.session.commit()
        
    def test13_init_start_stop(self):
        p = Post(
            text='some text',
            thread_id=self.thread.id,
            author_id=self.user.id,
            _start_date=datetime.now(),
            _stop_date=datetime.now(),
        )
        self.assertFalse(p.is_current())
        self.session.add(p)
        self.session.commit()
        
