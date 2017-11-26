#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import logging
import urllib
import json
from datetime import datetime

from PIL import Image
from io import StringIO, BytesIO
import base64

from .tornado_testing_base import TornadoBaseTestCase


class APIImageTestCase(TornadoBaseTestCase):
    
    def test1_post_image(self):
        raw_img = Image.new('RGBA', (1024,768), (255,255,255))
        out = BytesIO()
        raw_img.save(out, format='PNG')
        img = dict(src=base64.b64encode(out.getvalue()).decode())
        response = self.fetch(
            '/image',
            method='POST',
            body=urllib.parse.urlencode({'img': json.dumps(img)})
        )
        self.assertEqual(response.code, 200)
        body = json.loads(response.body.decode())
        self.assertEqual(body['img']['type'], 'image')