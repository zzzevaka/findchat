#!/usr/bin/env python3

import logging

from datetime import datetime, MAXYEAR
from sqlalchemy import Column, DateTime, and_
from sqlalchemy.ext.hybrid import hybrid_method

class StartStopMixin(object):

    _start_date = Column('start_date', DateTime(timezone=False), nullable=False, default=datetime.utcnow)
    _stop_date = Column('stop_date', DateTime(timezone=False), nullable=False, default=datetime(MAXYEAR, 12, 31))

    def stop(self):
        self._stop_date = datetime.utcnow()

    def revive(self):
        self._stop_date = datetime(MAXYEAR, 12, 31)

    # @property
    # def start_date(self):
    #     return self._start_date

    # @property
    # def stop_date(self):
    #     return self.stop_date

    @hybrid_method
    def is_current(self):
        '''returns 1 if now is between start_date and stop_date'''
        return self._start_date < datetime.utcnow() < self._stop_date

    @is_current.expression
    def is_current(cls):
        return and_(
            cls._start_date < datetime.utcnow(),
            cls._stop_date > datetime.utcnow()
        )

    @staticmethod
    def max_date():
        return datetime(MAXYEAR, 12, 31)