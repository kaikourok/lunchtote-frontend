import { RootState } from 'store';

export const selectCharacter = (state: RootState) => state.character;
export const selectIsAuthenticated = (state: RootState) =>
  state.character.isAuthenticated;
export const selectIsAuthenticationTried = (state: RootState) =>
  state.character.isAuthenticationTried;
export const selectCsrfToken = (state: RootState) => state.character.csrfToken;
export const selectExistsUnreadNotification = (state: RootState) =>
  state.character.existsUnreadNotification;
export const selectExistsUnreadMail = (state: RootState) =>
  state.character.existsUnreadMail;
export const selectAdministrator = (state: RootState) =>
  state.character.administrator;
