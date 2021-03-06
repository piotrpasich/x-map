import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import getGoogleApiClient from 'google-client-api';

import * as AppActions from '../actions/AppActions';
import * as UserActions from '../actions/UserActions';
import * as TeamActions from '../actions/TeamActions';
import * as ConferenceActions from '../actions/ConferenceActions';
import assignToEmpty from '../utils/assign';

/* Components */
import Header from './fragments/Header';
import Loader from './fragments/Loader';
import Map from './fragments/Map';

export class App extends Component {
  constructor(props, context) {
    super(props, context);
    if (props.actions && props.actions.routeChanged) {
      props.history.listen(props.actions.routeChanged);
    }

    this.state = {};

    props.history.listenBefore(this.preventLeavingProfileEditIfNeeded.bind(this));
  }

  componentDidMount() {
    getGoogleApiClient(gapi => {
      gapi.load('auth2', () => {
        gapi.auth2.init(process.env.GOOGLE_SETTINGS);
        this.setState({auth: gapi.auth2});

        const { actions } = this.props;
        actions.authenticate(() => {
          actions.userList();
          actions.teamList();
          actions.conferenceList();
          this.redirectToProfileFormIfNeeded();
        }, this.redirectToHomePage.bind(this));
      });
    });
  }

  redirectToHomePage() {
    this.props.history.push('/');
  }

  redirectToProfilePage(id) {
    this.props.history.push('/profile/' + id);
  }

  redirectToProfileFormIfNeeded() {
    const { currentUserId, isProfileFilled, history } = this.props;
    const profileEditPath = '/profile/' + currentUserId + '/edit';
    if (currentUserId && !isProfileFilled && !history.isActive(profileEditPath)) {
      this.props.history.push(profileEditPath);
    }
  }

  preventLeavingProfileEditIfNeeded(nextLocation) {
    const { currentUserId, isProfileFilled, history } = this.props;
    const profileEditPath = '/profile/' + currentUserId + '/edit';
    if (currentUserId && !isProfileFilled && (history.isActive(profileEditPath) || nextLocation.pathname !== profileEditPath)) {
      return false;
    }
  }

  renderMap() {
    return <Map onFeatureClick={this.redirectToProfilePage.bind(this)}/>;
  }

  render() {
    const { currentUserId, isSignedIn, usersLoaded, teamsLoaded, conferencesLoaded, users, actions } = this.props;

    let content;
    if (currentUserId && usersLoaded && teamsLoaded && conferencesLoaded) {
      content = (
        <div>
          <Header user={users[currentUserId]} onLogout={actions.logout.bind(null, this.redirectToHomePage.bind(this))}/>
          <ReactCSSTransitionGroup
            transitionName="transition"
            transitionAppear
            transitionAppearTimeout={450}
            transitionEnterTimeout={450}
            transitionLeaveTimeout={150}>
            {React.cloneElement(this.props.children, {
              key: this.props.location.pathname
            })}
          </ReactCSSTransitionGroup>
        </div>
      );
    } else {
      content = (
        <DocumentTitle title="Login | X-Map">
          <Loader isSignedIn={isSignedIn} auth={this.state.auth}/>
        </DocumentTitle>
      );
    }
    return (
      <div>
        <h1 className="sr-only sr-only-focusable">X-Map</h1>
        {isSignedIn ? this.renderMap() : null}
        {content}
      </div>
    );
  }
}

App.propTypes = {
  actions: PropTypes.shape({
    logout: PropTypes.func.isRequired,
    routeChanged: PropTypes.func
  }).isRequired,
  children: PropTypes.object,
  conferencesLoaded: PropTypes.bool,
  currentUserId: PropTypes.string,
  history: PropTypes.object.isRequired,
  isProfileFilled: PropTypes.bool.isRequired,
  isSignedIn: PropTypes.bool,
  location: PropTypes.shape({
    pathname: PropTypes.string
  }),
  teamsLoaded: PropTypes.bool,
  users: PropTypes.object,
  usersLoaded: PropTypes.bool
};

App.defaultProps = {
  isSignedIn: false,
  conferencesLoaded: false,
  usersLoaded: false,
  teamsLoaded: false,
  users: {},
  isProfileFilled: false
};

function mapStateToProps(state) {
  return {
    currentUserId: state.session.currentUserId,
    isSignedIn: state.session.isSignedIn,
    usersLoaded: state.session.usersLoaded,
    teamsLoaded: state.session.teamsLoaded,
    conferencesLoaded: state.session.conferencesLoaded,
    users: state.users,
    isProfileFilled: state.session.isProfileFilled
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(assignToEmpty(AppActions, UserActions, TeamActions, ConferenceActions), dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
