import expect from 'expect';
import sessionReducer from '../../js/reducers/sessionReducer';
import * as AppConstants from '../../js/constants/AppConstants';

// Test Reducer
describe('sessionReducer', () => {

  it('should return empty object as the initial state', () => {
    expect(sessionReducer(undefined, {})).toEqual({});
  });

  it('should set current user on APP_LOGIN_SUCCESS action', () => {
    const user = { id: 42 };
    const expected = { currentUserId: 42, currentUserLoaded: true };
    expect(sessionReducer({}, {type: AppConstants.APP_LOGIN_SUCCESS, user})).toEqual(expected);
  });

  it('should remove current user on APP_LOGIN_FAILURE action', () => {
    const state = { currentUserId: 42, currentUserLoaded: true };
    const expected = { currentUserId: undefined, currentUserLoaded: true };
    expect(sessionReducer(state, {type: AppConstants.APP_LOGIN_FAILURE})).toEqual(expected);
  });

  it('should remove current user on APP_LOGOUT_SUCCESS action', () => {
    const state = { currentUserId: 42, currentUserLoaded: true };
    const expected = { currentUserId: undefined, currentUserLoaded: true };
    expect(sessionReducer(state, {type: AppConstants.APP_LOGOUT_SUCCESS})).toEqual(expected);
  });

  it('should keep current user on APP_LOGOUT_FAILURE action', () => {
    const state = { currentUserId: 42, currentUserLoaded: true };
    expect(sessionReducer(state, {type: AppConstants.APP_LOGOUT_FAILURE})).toEqual(state);
  });

});