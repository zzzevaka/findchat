import React, {Component} from 'react';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import PageDummy from '../RegularPage';
import {NavLink, Switch, Route, Redirect} from 'react-router-dom';
import {FollowingThread} from '../thread';
import {getUserFollowing, getUserFollowers, loadUsers} from '../../actions';


const FOLLOWING_PLACEHOLDER = "User doesn't follow anybody";
const FOLLOWERS_PLACEHOLDER = "People don't follow this user";


class FollowPage extends Component {

    componentDidMount() {
        this.loadUser();
    }

    loadUser = () => {
        const {dispatch, user, match} = this.props;
        !user && dispatch(
            loadUsers(match.params.userID)
        );
    }

    loadFollowing = (limit, offset, dispatch) => {
        dispatch(
            getUserFollowing(
                this.props.match.params.userID,
                limit,
                offset
            )
        );
    }

    loadFollowers = (limit, offset, dispatch) => {
        dispatch(
            getUserFollowers(
                this.props.match.params.userID,
                limit,
                offset
            )
        );
    }

    render() {
        const {match, t} = this.props;
        const {userID} = match.params;
        return (
            <PageDummy>
                <div className='search-type-switch'>
                    <NavLink
                        to={`${match.url}/followers`}
                        className='link-no-style'
                        activeClassName='link-active'
                    >
                        {t("Followers")}
                    </NavLink>
                    <span>/</span>
                    <NavLink
                        to={`${match.url}/following`}
                        className='link-no-style'
                        activeClassName='link-active'
                    >
                        {t("Following")}
                    </NavLink>
                </div>
                <Route
                    exact path={match.url}
                    render={() => <Redirect to={`${match.url}/followers`} />}
                />
                <Switch>
                    <Route
                        path={`${match.url}/followers`}
                        render={
                            () => <FollowingThread
                                key='followers'
                                threadID={`user_followers_${userID}`}
                                loadMethod={this.loadFollowers}
                                placeholder={FOLLOWING_PLACEHOLDER}
                            />
                        }
                    />
                    <Route
                        path={`${match.url}/following`}
                        render={
                            () => <FollowingThread
                                key='following'
                                threadID={`user_following_${userID}`}
                                loadMethod={this.loadFollowing}
                                placeholder={FOLLOWERS_PLACEHOLDER}
                            />
                        }
                    />
                </Switch>
            </PageDummy>
        )
    }
}

FollowPage = translate('translations')(FollowPage);

function mapStateToProps(state, {match}) {
    return {
        user: state.users[match.params.userID]
    }
}

export default connect(mapStateToProps)(FollowPage);