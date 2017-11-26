#!/usr/bin/env python3

import unittest
from datetime import datetime

import __main__ as main

from ..models.auth import Auth
from ..models.user import User



class ModelAuthTestCase(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.session = main.SessionMaker()

    @classmethod
    def tearDownClass(cls):
        cls.session.close()

    def test10_init(self):
        a = Auth(login='auth_test', password='qwerty')
        a.user = User()
        self.session.add(a)
        self.session.commit()

    def test20_check_password_true(self):
        p = self.session.query(Auth).filter_by(login='auth_test').first()
        self.assertTrue(p.check_password('qwerty'))

    def test21_check_password_false(self):
        p = self.session.query(Auth).filter_by(login='auth_test').first()
        self.assertFalse(p.check_password('123'))