#!/usr/bin/env python3

import logging
import unittest
import json
from datetime import datetime, date, timedelta

from sqlalchemy import and_, or_
from sqlalchemy.orm import joinedload, contains_eager

from ..models.user import User, DEFAULT_USER_ID
from ..models.post import Post
from ..models.thread import PostThread, User2Thread

import __main__ as main


class ModelThreadTestCase(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        cls.session = main.SessionMaker()
        cls.user = User()
        cls.session.commit()
            
    @classmethod
    def tearDownClass(cls):
        cls.session.close()

    def test1_init(self):
        self.session.add(
            PostThread(title='alloha')
        )
        self.session.commit()

    def test2_user2thread_init(self):
        t = self.session.query(PostThread).\
            filter(PostThread.title == 'alloha').first()
        u2t = User2Thread(
            user=self.user,
            thread=t
        )
        self.session.add(u2t)
        self.session.commit()
        
    def test2_posts_empty(self):
        t = self.session.query(PostThread).\
            filter(PostThread.title == 'alloha').first()
        self.assertFalse(t.posts)
        
    def test3_add_post(self):
        t = self.session.query(PostThread).\
            filter(PostThread.title == 'alloha').first()
        t.posts.append(
            Post(author_id=self.user.id, text='1')
        )
        self.session.commit()
        
    def test4_get_post_list(self):
        posts = self.session.query(Post).\
            join(PostThread, Post.thread_id == PostThread.id).\
            join(User2Thread).\
            filter(User2Thread.user_id == self.user.id).\
            filter(
                and_(
                    User2Thread._start_date <= Post._start_date,
                    User2Thread._stop_date >= Post._start_date
                )
            ).all()
            
    def test5_make_public(self):
        t = self.session.query(PostThread).\
            filter(PostThread.title == 'alloha').first()
        u2t = User2Thread(
            thread_id = t.id,
            user_id = DEFAULT_USER_ID,
            _start_date = datetime(1990,1,1)
        )
        self.session.add(u2t)
        self.session.commit()
        
    def test6_get_posts(self):
        u = self.user
        t = PostThread(title='test_thread')
        post_count = 100
        for x in range(post_count):
            t.posts.append(
                Post(
                    author_id = u.id,
                    text=str(x),
                    _start_date=datetime.utcnow() - timedelta(minutes=x)
                )
            )
        t.user2thread.append(
            User2Thread(
                user_id = u.id,
                _start_date = datetime.utcnow() - timedelta(minutes=post_count+10)
            )
        )
        self.session.add(t)
        self.session.commit()
        
        for m in (10, 30, 50):
            t.user2thread[0]._stop_date = datetime.utcnow() - timedelta(minutes=m)
            self.session.commit()
            thread = self.session.query(PostThread).\
                join(Post, Post.thread_id == PostThread.id).\
                options(contains_eager(PostThread.posts)).\
                join(User2Thread, PostThread.id == User2Thread.thread_id).\
                filter(PostThread.id == t.id).\
                filter(
                    and_(
                        Post._start_date >= User2Thread._start_date,
                        Post._start_date <= User2Thread._stop_date
                    )
                ).\
                filter(
                    or_(
                        User2Thread.user_id == u.id,
                        User2Thread.user_id == DEFAULT_USER_ID
                    )
                ).\
                all()[0]
                
    def test7_to_json(self):
        t = self.session.query(PostThread).options(
                joinedload(PostThread.posts)
            ).all()[-1]
        t.posts
        t_jsoin = t.to_json()
        t_fromjson = json.loads(t_jsoin)
        self.assertEqual(t_fromjson['id'], t.id)
        self.assertEqual(len(t_fromjson['posts']), len(t.posts))
        self.assertEqual(t_fromjson['posts'][0]['text'], t.posts[0].text)
        
        

