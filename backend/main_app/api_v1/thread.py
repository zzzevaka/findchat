import json
import logging
from datetime import datetime

import tornado.web
from tornado.escape import json_decode, json_encode


from sqlalchemy import and_, or_, func, types, distinct, text
from sqlalchemy.dialects import postgresql
from sqlalchemy.orm import contains_eager, joinedload, aliased
from sqlalchemy.orm.session import make_transient


from ..models.user import User, FollowUser, DEFAULT_USER_ID
from ..models.post import Post, PostAnswer, POST_TYPE
from ..models.thread import PostThread, User2Thread, IgnoredPosts, THREAD_TYPE
from ..models.post_like import PostLike
from ..models.postcontent import PostContent
from ..models.basemodel import alchemy_encoder
# from ..models.chat_offer import ChatOffer, AnswerChatOffer
from ..models.hashtag import Hashtag
from ..models.language import Language

from ..base_handler import BaseHandler


class ThreadInterface():
    
    def create_thread_betwwen_users(users, posts, session):
        '''
            creates and returns a chat thread between users
            if the thread does already exist just returns
        '''
        thread = None
        user2threads = {u_id: None for u_id in users}
        # get thread if exists
        thread = PostThread.getChatThread(
            [users],
            session
        ).all() 
        # the thread was found
        if len(result):
            thread = result[0].thread
            # write user2thread instance to thread_members
            # if they are current
            for u2t in result:
                if u2t.is_current():
                    user2threads[u2t.user_id] = u2t
        # the thread wasn't found. cerate new
        else:
            thread = PostThread(type=THREAD_TYPE['CHAT'])
            session.add(thread)
        # create new user2thread isinstances if it's needed
        for u_id, u2t in user2threads.items():
            if not u2t_inst:
                partner_id = self.current_user \
                    if user_id == offer.author_id \
                    else offer.author_id
                thread.user2thread.append(
                    User2Thread(
                        user_id=user_id,
                        _start_date = datetime.utcnow()
                    )
                )
        return thread


class API_Thread(BaseHandler):


    # @tornado.web.authenticated
    def get(self, thread_id):
        '''
            load a thread with posts
            
            example: GET /thread/1?limit=10&offset=10
                limit - how many posts must be loaded
                offset - how many posts must be skipped
                         from the tail
                
            returns a code and body:
                codes:
                    200 - normal
                    404 - a thread isn't found or current
                          user doesn't have permissions
                body:
                    look at ...api.v1.threads
        '''
        # self.current_user = 0;
        logging.error(self.current_user)
        limit = self.get_argument('limit', None)
        offset = self.get_argument('offset', None)
        for_export = dict(
            threads={},
            posts={},
            users={},
        )
        try:
            curr_u2t = None
            user2threads = self.db.query(
                    User2Thread
                ).options(
                    joinedload(User2Thread.thread)
                ).filter(
                    User2Thread.thread_id == int(thread_id)
                ).filter(
                    User2Thread.user_id.in_(
                        [self.current_user, DEFAULT_USER_ID]
                    )
                ).all()
            if not user2threads:
                raise tornado.web.HTTPError(404)
            for_export['threads'][thread_id] =\
                user2threads[0].thread.export_dict
            for u2t in user2threads:
                if u2t.is_current():
                    if u2t.user_id == self.current_user:
                        curr_u2t = u2t
                    if u2t.user_id == DEFAULT_USER_ID and not curr_u2t:
                        curr_u2t = u2t
            if curr_u2t:
                for_export['threads'][thread_id].update({
                    'active': True,
                    'allow_add_posts': curr_u2t.allow_add_posts,
                    'allow_del_posts': curr_u2t.allow_del_posts,
                    'allow_add_comments': curr_u2t.allow_add_comments
                })
            else:
                for_export['threads'][thread_id].update({
                    'closed': False,
                    'allow_add_posts': False,
                    'allow_del_posts': False,
                    'allow_del_posts': False
                })

            posts = self.db.query(
                    Post
                ).join(
                    User2Thread, Post.thread_id == User2Thread.thread_id
                ).outerjoin(
                    PostContent, Post.content_id == PostContent.id
                ).outerjoin(
                    IgnoredPosts, and_(
                        Post.id == IgnoredPosts.post_id,
                        User2Thread.id == IgnoredPosts.u2t_id
                    )
                ).options(
                    joinedload(Post.content)
                ).options(
                    joinedload(Post._author)
                ).filter(
                    Post.thread_id == thread_id
                ).filter(
                    or_(
                        Post._start_date == None,
                        and_(
                            Post._start_date >= User2Thread._start_date,
                            Post._start_date <= User2Thread._stop_date
                        )
                    )
                ).filter(
                    User2Thread.user_id.in_([self.current_user, DEFAULT_USER_ID])
                ).filter(
                    IgnoredPosts.post_id == None
                ).order_by(
                    Post.id.desc()
                ).distinct(
                ).limit(
                    limit
                ).offset(
                    offset
                ).all()
            # a thread is found
            if len(posts):
                for p in posts:
                    # get the posts as dict
                    for_export['posts'][p.id] = p.export_dict
                    for_export['users'][p.author_id] = p._author.export_dict
                # replace thread.posts on array of id
                for_export['threads'][thread_id]['posts'] = sorted(
                    list(for_export['posts'].keys()),
                    reverse=True
                )
            if len(posts) < int(limit or 0):
                logging.debug('limit: %i\n. posts count: %i' % (int(limit or 0), len(posts)))
                for_export['threads'][thread_id]['no_more_posts'] = True
            # dict -> json
            for_export = json.dumps(
                for_export,
                cls=alchemy_encoder(),
                check_circular=False,
            )
            logging.debug(for_export)
            self.finish(for_export)
            # a thread isn't found
        except tornado.web.HTTPError:
            raise
        except:
            logging.error('an error has occured', exc_info=True)
            raise tornado.web.HTTPError(500)


    @tornado.web.authenticated
    def post(self):
        '''
            Creates private thread between self.currrent user and
                post.author_id

            If the users have a private thread (has been chatting already) just
            updates the thread:
                - refreshs user2thread isinstances if it's needed'
                - adds post (created by post user answered)

            !!! TO DO !!! Example: POST thread

            Returns:
                threads:{
                    23: {thread.jsoined}
                }
                posts: {
                    435: {post.jsoined}
                }
        '''
        try:
            users_id = []
            # get post
            post = json.loads(self.get_argument('post'))
            offer_id = self.get_argument('offer_id', None)
            offer = None
            if offer_id:
                # check if user answered this post
                user_answered = self.db.query(PostAnswer).\
                    filter_by(post_id=offer_id).\
                    filter_by(user_id=self.current_user).\
                    first()
                if user_answered:
                    self.set_status(409)
                    self.finish(
                        json.dumps({'error': 'user answered early'})
                    )
                    return
                # find offer post
                offer_post = self.db.query(Post).\
                    join(Post.thread).\
                    options(joinedload('_author')).\
                    options(joinedload('content')).\
                    filter(Post.id == offer_id).\
                    filter(PostThread.type == THREAD_TYPE['CHAT_OFFER']).\
                    filter(Post.is_current()).\
                    first()
                if not offer_post:
                    self.set_status(404)
                    self.finish(
                        json.dumps({'error': 'offer not found'})
                    )
                    return
                users_id = [offer_post.author_id]
            else:
                # get users
                users_id = json.loads(self.get_argument('users_id'))
                logging.error(users_id)
                try:
                    users_id = [int(i) for i in users_id]
                except TypeError:
                    raise tornado.web.HTTPError(409)
                if (len(users_id) != 1):
                    raise tornado.web.HTTPError(409)
            # get thread
            thread = PostThread.get_actual_chat(
                users=[self.current_user, *users_id],
                session=self.db,
                create=True
            )
            if offer_id:
                self.db.add(
                    PostAnswer(post_id=offer_post.id, user_id=self.current_user)
                )
                self.db.expunge(offer_post)
                make_transient(offer_post)
                offer_post.id = None
                offer_post._start_date = None
                offer_post.type = POST_TYPE['CHAT_OFFER']
                thread.add_post(offer_post, users_read=[self.current_user])
            post = Post(
                thread=thread,
                author_id=self.current_user,
                **post
            )
            thread.add_post(
                post=post,
                users_read=[self.current_user],
                last=True
            )
            self.db.commit()
            for_export = {
                'thread_id': thread.id,
                'unreaded_posts': {
                    'thread_id': thread.id,
                    'count': 1
                },
            }
            for_export = json.dumps(
                for_export,
                cls=alchemy_encoder(),
                check_circular=False,
            )
            self.finish(for_export)
            self.db.commit()
            for u_id in users_id:
                self.redis.publish('updates:user:%s' % u_id, for_export)
        except tornado.web.HTTPError:
            raise
        except:
            logging.error(
                'fatal error:\n Request info:\n%s\narguments: %s\n' %\
                    (self.request, self.request.arguments),
                exc_info=True
            )


class API_ThreadChatOffers(BaseHandler):
    
    def post(self):
        '''
            Get chat offers
        '''
        limit = self.get_argument('limit', None)
        offset = self.get_argument('offset', None)
        search_filter = json.loads(self.get_argument('filter'))
        tag = None
        if search_filter['tags']:
            tag = search_filter['tags'][0]
        logging.debug(tag)
        for_export = {
            'posts': {},
            'threads': {
                'chat_offers': {
                    'id': 'chat_offers',
                    'posts': [],
                }
            },
            'users': {},
        }
        user_answered = self.db.query(PostAnswer.post_id).\
            filter_by(user_id=self.current_user).\
            subquery()
        request = self.db.query(Post).\
            join(Post.thread).\
            join(User2Thread, Post.thread_id == User2Thread.thread_id).\
            outerjoin(
                IgnoredPosts, and_(
                    Post.id == IgnoredPosts.post_id,
                    User2Thread.id == IgnoredPosts.u2t_id
                )
            ).\
            options(joinedload('_author', innerjoin='unnested')).\
            options(joinedload('content')).\
            filter(PostThread.type == THREAD_TYPE['CHAT_OFFER']).\
            filter(Post.is_current()).\
            filter(IgnoredPosts.post_id == None).\
            filter(Post.id.notin_(user_answered))
        if tag:
            request = request.join(Post.hashtags).filter(text("hashtags.name % '{}'".format(tag)))
        request.order_by(Post.id.desc())
        request.limit(limit)
        request.offset(offset)
        result = request.all()
        for p in result:
            for_export['posts'][p.id] = p.export_dict
            for_export['users'][p.author_id] = p._author.export_dict
            for_export['threads']['chat_offers']['posts'].append(p.id)
        if len(result) < int(limit or 1):
                for_export['threads']['chat_offers']['no_more_posts'] = True
        for_export = json.dumps(
                for_export,
                cls=alchemy_encoder(),
                check_circular=False
            )
        self.finish(for_export)


class API_ThreadPeople(BaseHandler):

    def post(self):
        '''
            GET USERS
        '''
        limit = self.get_argument('limit', None)
        offset = self.get_argument('offset', None)
        search_filter = json.loads(self.get_argument('filter'))
        for_export = {
            'posts': {},
            'threads': {
                'search_users': {
                    'id': 'search_users',
                    'posts': [],
                }
            },
            'users': {},
        }
        request = self.db.query(
            User,
            FollowUser.dst_user_id,
            func.count().label('total'),
            func.array_agg(
                distinct(Language.name),
                type_=postgresql.ARRAY(types.String, as_tuple=True)
            ),
            func.array_agg(
                distinct(Hashtag.name),
                type_=postgresql.ARRAY(types.String, as_tuple=True)
            )
        )
        request = request.outerjoin(
                        FollowUser,
                        and_(
                            User.id == FollowUser.dst_user_id,
                            FollowUser.src_user_id == self.current_user,
                            FollowUser.is_current()
                        )
                    )
        request = request.outerjoin(Language, User._languages)
        request = request.outerjoin(Hashtag, User.hashtags)
        if ('lang' in search_filter and search_filter['lang']):
            request = request.filter(Language.name.in_(search_filter['lang']))
        if ('tags' in search_filter and search_filter['tags']):
            request = request.filter(Hashtag.name.in_(search_filter['tags']))
        # if ('lang' in search_filter and search_filter['lang']):
        #     query = query.join(User.languages).filter(
        #         Language.name.in_(search_filter['lang'])
        #     )
        # if ('tags' in search_filter and search_filter['tags']):
        #     query = query.join(User.hashtags).filter(
        #         Hashtag.name.in_(search_filter['tags'])
        #     )
        request = request.group_by(User.id, FollowUser.dst_user_id)
        request = request.order_by('total DESC')
        request.limit(limit)
        request.offset(offset)

        result = request.all()
        for user, curr_user_follows, total, languages, hashtags in result:
            for_export['threads']['search_users']['posts'].append(user.id)
            for_export['users'][user.id] = {
                **user.export_dict,
                'lang': [i for i in languages if i],
                'hashtags': [i for i in hashtags if i],
                'current_user_follows': bool(curr_user_follows)
            }

        if len(result) < int(limit or 1):
                for_export['threads']['search_users']['no_more_posts'] = True
        for_export = json.dumps(
                for_export,
                cls=alchemy_encoder(),
                check_circular=False
            )
        self.finish(for_export)


class API_ThreadNews(BaseHandler):
    
    def get(self):
        '''
            get posts* of authors which current_user follows

            *photo_thread and chat_offers
        '''
        limit = self.get_argument('limit', None)
        offset = self.get_argument('offset', None)
        for_export = {
            'posts': {},
            'threads': {
                'news': {
                    'id': 'news',
                    'posts': [],
                }
            },
            'users': {},
        }
        result = self.db.query(
                Post, PostThread.type
            ).join(
                User2Thread, Post.thread_id == User2Thread.thread_id
            ).join(
                PostThread, Post.thread_id == PostThread.id
            ).join(
                FollowUser, and_(
                    Post.author_id == FollowUser.dst_user_id,
                    FollowUser.src_user_id == self.current_user,
                    FollowUser.is_current()
                )
            ).outerjoin(
                PostContent, Post.content_id == PostContent.id
            ).outerjoin(
                IgnoredPosts, and_(
                    Post.id == IgnoredPosts.post_id,
                    User2Thread.id == IgnoredPosts.u2t_id
                )
            ).options(
                joinedload(Post.content)
            ).options(
                joinedload(Post._author)
            ).filter(
                IgnoredPosts.post_id == None
            ).filter(
                Post.is_current()
            ).filter(
                User2Thread.user_id == DEFAULT_USER_ID
            ).order_by(
                Post.id.desc()
            ).distinct(
            ).limit(
                limit
            ).offset(
                offset
            ).all()
        # a thread is found
        if len(result):
            for (p, thread_type) in result:
                # get the posts as dict
                for_export['posts'][p.id] = {
                    'thread_type': thread_type,
                    **p.export_dict
                }
                for_export['users'][p.author_id] = p._author.export_dict
            # replace thread.posts on array of id
            for_export['threads']['news']['posts'] = sorted(
                list(for_export['posts'].keys()),
                reverse=True
            )
        if len(result) < int(limit or 1):
            for_export['threads']['news']['no_more_posts'] = True
        # dict -> json
        for_export = json.dumps(
            for_export,
            cls=alchemy_encoder(),
            check_circular=False,
        )
        logging.debug(for_export)
        self.finish(for_export)
    