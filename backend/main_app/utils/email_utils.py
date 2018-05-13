#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
sys.path.append('/app')
import re
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from tornado import template

from settings import unittest as settings

def email(address):
    if re.match(r'^[\w]+@[\w\.]+$', address):
        return address
    else:
        raise ValueError('%s isn\'t an email' % address)


def send_email(src, dst, subject, text=None, html=None):
    server = smtplib.SMTP(
        host=settings['smtp']['host'],
        port=settings['smtp']['port'],
    )

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = src
    msg['To'] = ', '.join(dst)
    if text:
        msg.attach(MIMEText(text, 'text'))
    if html:
        msg.attach(MIMEText(html, 'html'))

    server.send_message(msg)
    server.quit()

    return True

if __name__ == '__main__':
    text = 'look at HTML'
    tmpl = template.Template(
        '<html>Hello from html template<br><br>lala</html>'
    )
    html = tmpl.generate().decode()
    send_email(
        'src@mail.ru',
        ['dst@mail.ru', 'dst2@mail.ru'],
        'Test',
        'look at html',
        html,
    )
