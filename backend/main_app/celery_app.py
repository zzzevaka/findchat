#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import celery

from .utils.email_utils import send_email
from .utils.search import search_index

from settings import unittest as settings


app = celery.Celery(
    'tasks',
    broker='redis://{}/'.format(settings['redis']['host'])
)

@app.task
def task_send_email(*args, **kwargs):
    send_email(*args, **kwargs)



#
# ELASTIC
#

@app.task
def task_search_index(*args, **kwargs):
    search_index(*args, **kwargs)