import { Types } from 'store/actions/draft';
import { DraftState, MessageAutoSavePayload } from 'store/types/draft';

type DraftStateWithReady = DraftState & {
  ready: boolean;
};

export default function draftReducer(
  state: DraftStateWithReady = {
    ready: false,
    message: {
      autosave: '',
    },
  },
  action: { type: typeof Types[keyof typeof Types]; payload: any }
): DraftStateWithReady {
  switch (action.type) {
    case Types.LOAD_SUCCESS:
      return {
        ready: true,
        ...(action.payload as DraftState),
      };
    case Types.MESSAGE_AUTOSAVE:
      return {
        ...state,
        message: {
          ...state.message,
          autosave: (action.payload as MessageAutoSavePayload).content,
        },
      };
    default:
      return {
        ...state,
      };
  }
}
