import {
  InitialData,
  NotificationPayload,
  SignInPayload,
  SignUpPayload,
} from 'store/types/character';

export const Types = {
  SIGN_UP_REQUEST: 'character/sign_up_request' as 'character/sign_up_request',
  SIGN_IN_REQUEST: 'character/sign_in_request' as 'character/sign_in_request',
  SIGN_OUT_REQUEST:
    'character/sign_out_request' as 'character/sign_out_request',
  SIGN_OUT_SUCCESS:
    'character/sign_out_success' as 'character/sign_out_success',
  FETCH_DATA_REQUEST:
    'character/fetch_data_request' as 'character/fetch_data_request',
  FETCH_DATA_SUCCESS:
    'character/fetch_data_success' as 'character/fetch_data_success',
  FETCH_DATA_FAILURE:
    'character/fetch_data_failure' as 'character/fetch_data_failure',
  READ_ALL_MAILS: 'character/read_all_mails' as 'character/read_all_mails',
  READ_NOTIFICATIONS:
    'character/read_notifications' as 'character/read_notifications',
  NOTIFY: 'character/nofity' as 'character/notify',
};

export const signUpRequest = (payload: SignUpPayload) => ({
  type: Types.SIGN_UP_REQUEST,
  payload: payload,
});

export const signInRequest = (payload: SignInPayload) => ({
  type: Types.SIGN_IN_REQUEST,
  payload: payload,
});

export const signOutRequest = () => ({
  type: Types.SIGN_OUT_REQUEST,
});

export const signOutSuccess = () => ({
  type: Types.SIGN_OUT_SUCCESS,
});

export const fetchDataRequest = () => ({
  type: Types.FETCH_DATA_REQUEST,
});

export const fetchDataSuccess = (payload: InitialData) => ({
  type: Types.FETCH_DATA_SUCCESS,
  payload: payload,
});

export const fetchDataFailure = () => ({
  type: Types.FETCH_DATA_FAILURE,
});

export const readAllMails = () => ({
  type: Types.READ_ALL_MAILS,
});

export const readNotifications = () => ({
  type: Types.READ_NOTIFICATIONS,
});

export const notify = (payload: NotificationPayload) => ({
  type: Types.NOTIFY,
  payload: payload,
});
