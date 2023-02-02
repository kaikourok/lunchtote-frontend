import localforage from 'localforage';
import { call, fork, put, takeEvery } from 'redux-saga/effects';

import * as actions from 'store/actions/draft';
import { DraftState } from 'store/types/draft';
import { EffectRT } from 'types/store';

const KEYS = {
  MESSAGE_AUTOSAVE: 'drafts-message-autosave',
};

/*-------------------------------------------------------------------------------------------------
  Load
-------------------------------------------------------------------------------------------------*/

async function loadSavedDrafts(): Promise<DraftState> {
  const [messageAutoSave] = await Promise.all([
    localforage.getItem<string>(KEYS.MESSAGE_AUTOSAVE),
  ]);

  return {
    message: {
      autosave: messageAutoSave || '',
    },
  };
}

function* load() {
  const resultCall = call(loadSavedDrafts);
  const result: EffectRT<typeof resultCall> = yield resultCall;

  yield put(actions.loadSuccess(result));
}

function* watchLoadRequest() {
  yield takeEvery(actions.Types.LOAD, load);
}

/*-------------------------------------------------------------------------------------------------
  MessageAutoSave
-------------------------------------------------------------------------------------------------*/

async function saveMessageAutoSaveData(content: string) {
  return await localforage.setItem(KEYS.MESSAGE_AUTOSAVE, content);
}

function* messageAutoSave(
  action: ReturnType<typeof actions.messageAutoSaveRequest>
) {
  yield call(saveMessageAutoSaveData, action.payload.content);
}

function* watchMessageAutoSaveRequest() {
  yield takeEvery(actions.Types.MESSAGE_AUTOSAVE, messageAutoSave);
}

/*-------------------------------------------------------------------------------------------------
  export
-------------------------------------------------------------------------------------------------*/

const draftSagas = [fork(watchLoadRequest), fork(watchMessageAutoSaveRequest)];

export default draftSagas;
