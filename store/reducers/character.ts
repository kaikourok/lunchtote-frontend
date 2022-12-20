import { Types } from 'store/actions/character';
import { InitialData } from 'store/types/character';

// ログインしている際のステータス
type AuthenticatedStatus = {
  isAuthenticated: true;
  id: number;
  csrfToken: string;
  notificationToken: string;
  existsUnreadNotification: boolean;
  existsUnreadMail: boolean;
  administrator: boolean;
};

// ログインしていない際のステータス
type NonAuthenticatedStatus = {
  isAuthenticated: false;
  id: null;
  csrfToken: null;
  notificationToken: null;
  existsUnreadNotification: false;
  existsUnreadMail: false;
  administrator: false;
};

type AuthenticationStatus = AuthenticatedStatus | NonAuthenticatedStatus;

type AuthenticationTriedStatus = {
  isAuthenticationTried: boolean;
};

export type CharacterStatus = AuthenticationStatus & AuthenticationTriedStatus;

const initialState = {
  isAuthenticated: false,
  isAuthenticationTried: false,
  id: null,
  csrfToken: null,
  notificationToken: null,
  existsUnreadNotification: false,
  existsUnreadMail: false,
  administrator: false,
} as CharacterStatus;

export default function characterReducer(
  state = initialState,
  action: { type: typeof Types[keyof typeof Types]; payload: any }
): CharacterStatus {
  switch (action.type) {
    case Types.FETCH_DATA_SUCCESS:
      const data = action.payload as InitialData;
      return {
        ...state,
        isAuthenticated: true,
        isAuthenticationTried: true,
        ...data,
      };
    case Types.FETCH_DATA_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        isAuthenticationTried: true,
        id: null,
        csrfToken: null,
        notificationToken: null,
        existsUnreadNotification: false,
        existsUnreadMail: false,
        administrator: false,
      };
    case Types.SIGN_OUT_SUCCESS:
      return {
        ...initialState,
        isAuthenticationTried: true,
      };
    case Types.READ_ALL_MAILS:
      return {
        ...state,
        existsUnreadMail: false,
      };
    case Types.READ_NOTIFICATIONS:
      return {
        ...state,
        existsUnreadNotification: false,
      };
    case Types.NOTIFY:
      if (state.isAuthenticated) {
        return {
          ...state,
          existsUnreadNotification: true,
        };
      }
    default:
      return state;
  }
}
