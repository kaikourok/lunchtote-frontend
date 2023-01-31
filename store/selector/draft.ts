import { RootState } from 'store';

export const selectAutoSavedMessage = (state: RootState) =>
  state.draft.ready ? state.draft.message.autosave : null;
