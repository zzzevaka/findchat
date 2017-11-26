#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import logging
import urllib

from .tornado_testing_base import TornadoBaseTestCase

class APILanguageTestCase(TornadoBaseTestCase):
    
    def test1_get(self):
        '''
            get languages in json format
        '''
        response = self.fetch('/language')
        self.assertEqual(response.code, 200)
