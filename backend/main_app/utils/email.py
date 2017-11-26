#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re

def email(address):
    if re.match(r'^[\w]+@[\w\.]+$', address):
        return address
    else:
        raise ValueError('%s isn\'t an email' % address)