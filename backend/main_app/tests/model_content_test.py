#!/usr/bin/env python3

import unittest
from PIL import Image

from ..models.postcontent import ImageContent

import __main__ as main


class ModelContentTestCase(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        cls.session = main.SessionMaker()
        cls.img = Image.new('RGBA', (1024,768), (255,255,255))
        
    def test1_init(self):
        self.session.add(
            ImageContent(
                img=self.img
            )
        )
        self.session.commit()
