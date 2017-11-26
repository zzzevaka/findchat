#!/usr/bin/env python3

from PIL import Image, ExifTags
from PIL.JpegImagePlugin import JpegImageFile
from PIL.PngImagePlugin import PngImageFile


# WHILE DEV

import logging

ACCEPTED_FORMATS = ['JPEG', 'PNG']

def resize_with_max(img, max_size):
    '''
        resize image with max size from argument
        GETS:
            - PIL.Image instance
            - Array with integers
        RETURNS: Image instance
        EXAMPLE:
            resize_with_max(img, [100,50])
    '''
    try:
        max_size = [int(i) for i in max_size]
    except ValueError:
        raise ValueError('max_size must be a list of integers')
    try:
        ratio = max(img.size[0] / max_size[0], img.size[1] / max_size[1])
        return img if ratio <= 1 else img.resize([int(v/ratio) for v in img.size])
    except AttributeError:
        raise ValueError(
            'image must be an PIL.Image instance. Not %s' %
            type(img)
        )

def rotate_if_needed(img):
    '''
        When a picture is taller than it is wide, it means the camera was
        rotated. Some cameras can detect this and write that info in the
        picture's EXIF metadata. Some viewers take note of this metadata and
        display the image appropriately.

        PIL can read the picture's metadata, but it does not write/copy
        metadata when you save an Image. Consequently, your smart image viewer
        will not rotate the image as it did before.

        Read the metadata using PIL.ExifTags, and rotate if necessary
    '''
    try:
        exif=dict(
            (ExifTags.TAGS[k], v) for k, v in img._getexif().items()
                if k in ExifTags.TAGS
        )
        if exif['Orientation'] == 3:
            return img.rotate(180, expand=True)
        elif exif['Orientation'] == 6:
            return img.rotate(270, expand=True)
        elif exif['Orientation'] == 8:
            return img.rotate(90, expand=True)
        else:
            return img
    except (AttributeError, KeyError, IndexError):
        # cases: image don't have getexif
        return img