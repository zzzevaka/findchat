#!/usr/bin/env python3

from datetime import datetime
import unittest
from sqlalchemy.exc import IntegrityError

from ..models.user import User

import __main__ as main


class ModelUserTestCase(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        cls.session = main.SessionMaker()
    
    @classmethod
    def tearDownClass(cls):
        cls.session.close()


    def test11_init_right(self):
        p = User()
        self.session.add(p)
        self.session.commit()
    
    def test12_init_with_incorrect_arguments(self):
        with self.assertRaises(ValueError):
            p = User(
                    firstname='Leo',
                    birth_date='october, 28',
                    gender='male'
                )