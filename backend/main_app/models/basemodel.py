#!/usr/bin/env python3

import json
import logging
from datetime import datetime
from sqlalchemy.ext.declarative import declarative_base, DeclarativeMeta
from sqlalchemy.orm import class_mapper


STRFTIME_FORMAT = '%Y-%m-%dT%H:%M:%S'

class BaseModel(declarative_base()):
    
    __abstract__ = True
    
    def to_json(self):
        return json.dumps(self, cls=alchemy_encoder(), check_circular=False)

    @property
    def export_dict(self):
        return {k:v for k,v in self.__dict__.items() if not k.startswith('_')}
        
    @property
    def editable_by_api(self):
        return ()

def alchemy_encoder():
    _visited_objs = []
    class AlchemyEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, datetime):
                return obj.strftime(STRFTIME_FORMAT)
            if isinstance(obj.__class__, DeclarativeMeta):
                if obj in _visited_objs:
                    return
                else:
                    _visited_objs.append(obj)

                    return {k:v for k,v in obj.__dict__.items() if\
                        not k.startswith('_')}
                    return json.JSONEncoder.default(self, obj)
    return AlchemyEncoder
