#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from elasticsearch import Elasticsearch

ES_URL = 'http://elastic:9200'
ES = Elasticsearch(ES_URL)
INDEX = 'findchat-search'


# ['settings']['analysis']['analyzer']['edgengram_mapping_analyzer'] = {
#             "type": "custom",
#             "tokenizer": "standard",
#             "filter": ["lowercase", "haystack_edgengram"],
#             "char_filter": ["russian_mapping"]


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
                    # 'filter': ['lowercase',
                    #            'russian_stop', 'russian_morphology',
                    #            'english_morphology', 'english_stopwords'],
                    'filter': ['lowercase',
                               # 'russian_morphology',
                               # 'english_morphology',
                               'custom_edgengram']
                }
            }
        }
    }
}


def search_index(doc_type, id, body, index=INDEX):
    ES.index(index=index, doc_type=doc_type, id=id, body=body)


def create_mapping(mapping=MAPPING):
    ES.indices.create(index=INDEX, ignore=400, body=MAPPING)