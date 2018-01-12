import { combineReducers } from 'redux';
import threads from './threads';
import posts from './posts';
import users from './users';
import postLikes from './postLikes';
import chatOffers from './chatOffers';
import rawThreads from './rawThreads';
import searchFilter from './searchFilter';
import searchUsers from './searchUsers';
import postComposers from './postComposers';
import uploadImages from './uploadImages';
// import sideBar from './sideBar';
import unreadedPosts from './unreadedPosts';
import auth from './auth';
import {reducer as notifications} from 'react-notification-system-redux';

export default combineReducers({
  threads,
  posts,
  users,
  postLikes,
  chatOffers,
  rawThreads,
  searchFilter,
  searchUsers,
  postComposers,
  uploadImages,
  unreadedPosts,
  notifications,
  auth
});
