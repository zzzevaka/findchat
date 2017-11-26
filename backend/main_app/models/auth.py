#!/usr/bin/env python3

import re
import hashlib
import bcrypt
from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, LargeBinary, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property


from .basemodel import BaseModel

MAX_LOGIN_LENGTH = 50;
LOGIN_REGEXP = re.compile('^([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)@([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)[\\.]([a-zA-Z]{2,9})$')
PASSWORD_REGEXP = re.compile('^[0-9a-zA-Z&%$!@_]{4,30}$')

class Auth(BaseModel):

    __tablename__ = 'auth'

    id = Column('auth_id', Integer, primary_key=True)
    login = Column(String(MAX_LOGIN_LENGTH), nullable=False, index=True)
    password = Column(LargeBinary, nullable=False)
    change_auth_id = Column(Integer, index=True)
    change_time = Column(DateTime, default=datetime.utcnow())
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)

    user = relationship('User')

    def __init__(self, password, **kwargs):
        # self.password = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
        self.password = self.get_hash(password)
        super(Auth, self).__init__(**kwargs)        

    def check_password(self, password):
        '''is hash of password from argument are equal to self.password'''
        # return bcrypt.hashpw(password.encode(), self.password) == self.password
        return self.get_hash(password, self.password) == self.password

    @staticmethod
    def get_hash(string, salt=None):
        return bcrypt.hashpw(string.encode(), salt or bcrypt.gensalt())

    @staticmethod
    def is_valid_login(val):
        return bool(LOGIN_REGEXP.match(val))

    @staticmethod
    def is_valid_password(val):
        return bool(PASSWORD_REGEXP.match(val))
    

