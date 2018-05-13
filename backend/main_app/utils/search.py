#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from elasticsearch import Elasticsearch
import settings

ES = Elasticsearch('http://{}:{}'.format(settings.unittest['elastic']['host'], settings.unittest['elastic']['port']))
INDEX = 'findchat-search'


MAPPING = {
    'mappings': {
        'post': {
            'properties': {
                'text': {
                    'type': 'string',
                    'analyzer': 'edgengram_mapping_analyzer',
                },
                'publish_at': {
                    'type': 'date',
                    'format': 'dateOptionalTime',
                },
                'hashtags': {
                    'type': 'string',
                    'analyzer': 'edgengram_mapping_analyzer',
                },
            }
        }
    },
    'settings': {
        'number_of_shards': 1,
        'number_of_replicas': 0,

        'analysis': {
            'filter': {
                'custom_edgengram': {
                    'token_chars' : [ 'letter', 'digit' ],
                    'min_gram' : "1",
                    'type' : 'edgeNGram',
                    'max_gram' : '15',
                }
            },
            'analyzer': {
                'edgengram_mapping_analyzer': {
                    'type': 'custom',
                    'tokenizer': 'standard',
                    'filter': ['lowercase', 'custom_edgengram']
                }
            }
        }
    }
}


def search_index(doc_type, id, body, index=INDEX):
    ES.index(index=index, doc_type=doc_type, id=id, body=body)


def create_mapping(mapping=MAPPING):
    ES.indices.create(index=INDEX, ignore=400, body=MAPPING)


def search(search_term, fields=None):
    result = ES.search(
        index=INDEX,
        body={
            'query': {
                'multi_match': {
                    'query': search_term,
                    'fields': ['text^0.9', 'hashtags']
                }
            },
            '_source': ['_id'],
             'min_score': 0.25
        }
    )
    return [int(h['_id']) for h in result['hits']['hits']]