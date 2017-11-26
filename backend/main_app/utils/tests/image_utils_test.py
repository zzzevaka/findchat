#!/usr/bin/env python3

import os
import sys
from PIL import Image
import unittest
import logging

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from image_utils import *

formats = []

class ImageUtilsTestCase(unittest.TestCase):
    
    def test2_resize_with_max_ok(self):
        f = os.path.join(os.path.dirname(__file__), 'test_image1.jpg')
        with Image.open(f) as img:
            new_img = resize_with_max(img, [100,100])
            self.assertTrue(new_img.size[0] <= 100 and new_img.size[1] <= 100)

    def test2_resize_with_max_not_image(self):
        with self.assertRaises(ValueError):
            img = 'I am an image'
            new_img = resize_with_max(img, [100,100])

    def test3_resize_with_max_too_large_max(self):
        f = os.path.join(os.path.dirname(__file__), 'test_image1.jpg')
        with Image.open(f) as img:
            new_img = resize_with_max(img, [5000,5000])
            self.assertEqual(img, new_img)