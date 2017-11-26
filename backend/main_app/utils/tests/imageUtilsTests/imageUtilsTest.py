#!/usr/bin/env python3

import os
from PIL import Image
import unittest
import logging

from ..image_utils_test import *


class ImageUtilsTestCase(unittest.TestCase):

    # def test1_resizeWithMax(self):
    #     f = os.path.join(os.path.dirname(__file__), 'test_image1.jpg')
    #     img = Image.open(f)
    #     img.close()
    #     new_img = resize_with_max(img, [100,100])
    #     logging.error(size)
    #     self.assertTrue(new_img.size[0] < 100 and new_img.size[1] < 100)

    # def test2(self):
    #     aq = 1
    #     self.assertTrue(aq == 1)


if __name__ == '__main__':
    unittest.main()