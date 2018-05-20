#!/usr/bin/env python3

from datetime import datetime

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from .basemodel import BaseModel, STRFTIME_FORMAT
# from .post import Post
from .startstop_mixin import StartStopMixin
from .hashtag import Hashtag
from .thread import PostThread, User2Thread, THREAD_TYPE


DEFAULT_USER_ID = 0

MAX_LEN = dict(
    _username=30,
    firstname=50,
    lastname=50,
    title=140,
    about=1000,
    _email=200,
    gender=6,
)


class User(BaseModel, StartStopMixin):

    __tablename__ = 'users'

    id = Column('user_id', Integer, primary_key=True)
    firstname = Column(String(MAX_LEN['firstname']), index=True, default='nobody')
    lastname = Column(String(MAX_LEN['lastname']), index=True)
    birth_date = Column(DateTime, index=True, default=datetime(1960, 1, 1))
    gender = Column(String(MAX_LEN['gender']), index=True)
    _hard_block = Column('hard_block', Integer, default=0)
    _usertype_id = Column('usertype_id', Integer)
    about = Column(String(MAX_LEN['about']), index=False)
    wall_thread_id = Column(Integer, ForeignKey('threads.thread_id'))
    photo_thread_id = Column(Integer, ForeignKey('threads.thread_id'))
    offer_thread_id = Column(Integer, ForeignKey('threads.thread_id'))
    avatar_id = Column(Integer, ForeignKey('posts.post_id'))
    thumbnail = Column(String(200))
    
    wall_thread = relationship(
        'PostThread',
        primaryjoin = 'User.wall_thread_id == PostThread.id'
    )
    photo_thread = relationship(
        'PostThread',
         primaryjoin = 'User.photo_thread_id == PostThread.id'
    )
    offer_thread = relationship(
        'PostThread',
         primaryjoin = 'User.offer_thread_id == PostThread.id'
    )
    avatar = relationship(
        'Post',
        primaryjoin = 'User.avatar_id == Post.id',
    )

    def __init__(self, *args, **kwargs):
        super(User, self).__init__(*args, **kwargs)
        self.wall_thread = PostThread()
        self.photo_thread = PostThread()
        self.offer_thread = PostThread(type=THREAD_TYPE['CHAT_OFFER'])
        self.wall_thread.user2thread.append(
            User2Thread(user=self, allow_del_posts=True),
        )
        self.wall_thread.user2thread.append(
            User2Thread(user_id=DEFAULT_USER_ID, allow_add_posts=False),
        )
        self.photo_thread.user2thread.append(
            User2Thread(user=self, allow_del_posts=True)
        )
        self.photo_thread.user2thread.append(
            User2Thread(user_id=DEFAULT_USER_ID, allow_add_posts=False)
        )
        self.offer_thread.user2thread.append(
            User2Thread(user=self, allow_del_posts=True)
        )
        self.offer_thread.user2thread.append(
            User2Thread(user_id=DEFAULT_USER_ID, allow_add_posts=False)
        )

    def __setattr__(self, key, value):
        '''a checking of attribut setting'''
        if key in ('_start_date', 'birth_date') and type(value) is not datetime:
            try:
                value = datetime.strptime(value, STRFTIME_FORMAT)
            except:
                raise ValueError(key, '%s - incorrect' % key)
        elif key in ('_username', 'firstname', 'lastname', 'title', 'about'):
            if len(str(value)) > MAX_LEN[key]:
               raise ValueError(key, 'max lenght is %i' % (key, MAX_LEN[key]))
        elif key in ('_hard_block', '_usertype_id'):
            int(value)
        elif key is '_email' and not User.is_email(value):
            raise ValueError(key, 'invalid format of email')
        super(User, self).__setattr__(key, value)

    def update_languages(self, langs):
        '''
            update User.languages (table lang2user)
            get list of Language isinstances
        '''
        user_langs = set(self._languages)
        arg_langs = set(langs)
        # need to delete
        for l in user_langs - arg_langs:
            self._languages.remove(l)
        # need to add
        for l in arg_langs - user_langs:
            self._languages.append(l)
        return 1

    def get_search_index(self):
        return {
            'name': self.fullname,
            'text': self.about,
            'age': self.age,
            'languages': [l.name for l in self._languages],
            'hashtags': [h.name for h in self.hashtags],
        }

    @property
    def age(self):
        return int((datetime.now() - self.birth_date).days / 365.25)
        
    @property
    def fullname(self):
        return self.firstname
        # return '%s %s' % (self.firstname, self.lastname)

    @property
    def editable_by_api(self):
        not_editable = ('id', 'wall_thread_id', 'photo_thread_id')
        ret = [k for k in self.export_dict.keys() if k not in not_editable]
        ret.append('lang')
        return ret

    @staticmethod
    def get_default():
        return User(id=DEFAULT_USER_ID)


class FollowUser(BaseModel, StartStopMixin):

    __tablename__ = 'follow_user'

    id = Column('follow_user_id', Integer, primary_key=True)
    src_user_id = Column(Integer, ForeignKey('users.user_id'), index=True)
    dst_user_id = Column(Integer, ForeignKey('users.user_id'), index=True)

    src_user = relationship(
        User,
        primaryjoin='FollowUser.src_user_id == User.id'
    )

    dst_user = relationship(
        User,
        primaryjoin='FollowUser.dst_user_id == User.id'
    )


class FollowHashtag(BaseModel, StartStopMixin):

    __tablename__ = 'follow_hashtag'

    id = Column('follow_hashtag_id', Integer, primary_key=True)
    src_user_id = Column(Integer, ForeignKey('users.user_id'), index=True)
    dst_hashtag_id = Column(Integer, ForeignKey('hashtags.hashtag_id'), index=True)
