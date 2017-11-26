#!/usr/bin/env python3

import logging
import os.path
from uuid import uuid4

from sqlalchemy import Table, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from .basemodel import BaseModel

from main_app.utils.image_utils import resize_with_max, rotate_if_needed


PREFIX_DIR = '/htdocs/static/img'
    

class PostContent(BaseModel):
    
    
    __tablename__ = 'post_content'
    
    id = Column('content_id', Integer, primary_key=True)
    type = Column(String(20), nullable=False, index=True)
    full = Column(String(300), nullable=False)
    preview = Column(String(300), nullable=False)
    width = Column(Integer)
    height = Column(Integer)
    _prefix_dir = Column(String(500), default=PREFIX_DIR)

    @property
    def os_path_full(self):
        return os.path.join(self.prefix_dir, self.full)

    @property
    def os_path_preview(self):
        return os.path.join(self.prefix_dir, self.preview)
    
    # @property
    # def export_dict(self):
    #     return {k:getattr(self,k) for k in ('type', 'full', 'preview')}

class ImageContent(PostContent):
    
    SIZES = dict(
        full = (2000,1000),
        preview = (400,400)
    )

    __mapper_args__ = {
        'polymorphic_identity':'manager',
    }

    def __init__(self, img, prefix_dir=PREFIX_DIR, crop=None, fmt='png', *args, **kwargs):
        imgname = str(uuid4())
        img = rotate_if_needed(img)
        if crop:
            img = img.crop([
                crop['x'],
                crop['y'],
                crop['x'] + crop['width'],
                crop['y'] + crop['height']
            ])
        for s_n, s_v in self.SIZES.items():
            resized = resize_with_max(img, s_v)
            if (s_n is 'full'):
                kwargs['width'] = resized.size[0]
                kwargs['height'] = resized.size[1]
            filename = '%s.%s.%s' % (str(imgname), s_n, fmt)
            resized.save(os.path.join(prefix_dir, filename))
            kwargs[s_n] = filename
        kwargs['_prefix_dir'] = prefix_dir
        super(ImageContent, self).__init__(type='image', *args, **kwargs)
