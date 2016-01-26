import {
  APP_LOGIN_SUCCESS,
  APP_LOGIN_FAILURE,
  APP_LOGOUT_SUCCESS,
  APP_LOGOUT_FAILURE,
  USER_GET_CURRENT_SUCCESS,
  USER_GET_CURRENT_FAILURE,
  USER_LIST_SUCCESS,
  USER_LIST_FAILURE
} from '../constants/AppConstants';

import assignToEmpty from './../utils/assign';

function sessionReducer(session = {}, action) {
  Object.freeze(session);

  switch (action.type) {
    case APP_LOGIN_SUCCESS:
    case USER_GET_CURRENT_SUCCESS:
      return assignToEmpty(session, { currentUserId: action.user.id, currentUserLoaded: true });
    case USER_GET_CURRENT_FAILURE:
    case APP_LOGOUT_SUCCESS:
      return assignToEmpty(session, { currentUserId: undefined, currentUserLoaded: true });
    case USER_LIST_SUCCESS:
    case USER_LIST_FAILURE:
      return assignToEmpty(session, { usersLoaded: true });
    case APP_LOGIN_FAILURE:
      return assignToEmpty(session, { currentUserId: undefined, currentUserLoaded: true });
    case APP_LOGOUT_SUCCESS:
    case APP_LOGOUT_FAILURE:
    default:
      return session;
  }
}

export default sessionReducer;