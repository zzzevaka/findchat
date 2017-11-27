#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import logging
import base64
import json
import os.path
from io import BytesIO
from PIL import Image
import tornado.web
from ..base_handler import BaseHandler
from ..models.postcontent import ImageContent



class API_Image(BaseHandler):

    def post(self):
        '''upload image'''
        try:
            arg_img = json.loads(self.get_argument('img'))
            src_decoded = base64.b64decode(arg_img['src'].split(',')[-1])
            src_img = Image.open(BytesIO(src_decoded))
            img = ImageContent(
                src_img,
                os.path.join(self.settings.get('static_path'), 'img'),
                crop=arg_img['crop'] if 'crop' in arg_img else None
            )
            self.db.add(img)
            self.db.commit()
            self.db.refresh(img)
            self.finish({'img': img.export_dict})
        except tornado.web.HTTPError:
            raise
        except:
            logging.error('an error has occured', exc_info=True)
            raise tornado.web.HTTPError(500)
