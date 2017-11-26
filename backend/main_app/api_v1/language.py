#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import logging
from tornado.web import HTTPError
from tornado.escape import json_decode, json_encode

from ..models.language import Language
from ..base_handler import BaseHandler


class API_Language(BaseHandler):
    

    def get(self):
        try:
            languages = self.db.query(Language).all()
            logging.debug([l.export_dict for l in languages])
            self.finish(json_encode([l.export_dict for l in languages]))
        except HTTPError:
            raise
        except:
            logging.debug('unexected error', exc_info=True)
            raise HTTPError(500)