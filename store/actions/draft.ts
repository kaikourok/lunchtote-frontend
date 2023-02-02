import { DraftState, MessageAutoSavePayload } from 'store/types/draft';

export const Types = {
  LOAD: 'draft/load' as 'draft/load',
  LOAD_SUCCESS: 'draft/load_success' as 'draft/load_success',
  MESSAGE_AUTOSAVE: 'draft/message_autosave' as 'draft/message_autosave',
};

export const loadRequest = () => ({
  type: Types.LOAD,
});

export const loadSuccess = (payload: DraftState) => ({
  type: Types.LOAD_SUCCESS,
  payload: payload,
});

export const messageAutoSaveRequest = (payload: MessageAutoSavePayload) => ({
  type: Types.MESSAGE_AUTOSAVE,
  payload: payload,
});
