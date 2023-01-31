import router from 'next/router';
import toast from 'react-hot-toast';
import { call, fork, put, select, takeEvery } from 'redux-saga/effects';

import characterIdText from 'lib/characterIdText';
import hashPassword from 'lib/hashPassword';
import axios from 'plugins/axios';
import * as actions from 'store/actions/character';
import { selectCsrfToken } from 'store/selector/character';
import { InitialData } from 'store/types/character';
import { EffectRT, Replace } from 'types/store';

/*-------------------------------------------------------------------------------------------------
  FetchData
-------------------------------------------------------------------------------------------------*/

async function getInitialData() {
  try {
    const response = await axios.get<
      Replace<InitialData, { administrator?: boolean }>
    >('/initial-data');

    return {
      ...response.data,
      administrator: !!response.data.administrator,
    };
  } catch {
    return null;
  }
}

function* fetchData() {
  const resultCall = call(getInitialData);
  const result: EffectRT<typeof resultCall> = yield resultCall;

  if (result) {
    yield put(actions.fetchDataSuccess(result));
  } else {
    yield put(actions.fetchDataFailure());
  }
}

function* watchFetchDataRequest() {
  yield takeEvery(actions.Types.FETCH_DATA_REQUEST, fetchData);
}

/*-------------------------------------------------------------------------------------------------
  SignIn
-------------------------------------------------------------------------------------------------*/

async function postSignIn(action: ReturnType<typeof actions.signInRequest>) {
  const password = hashPassword(action.payload.password);

  try {
    await axios.post('/signin', {
      ...action.payload,
      password,
    });
  } catch {
    return false;
  }

  return true;
}

function* signIn(action: ReturnType<typeof actions.signInRequest>) {
  const resultCall = call(postSignIn, action);
  const result: EffectRT<typeof resultCall> = yield resultCall;

  if (result) {
    yield call(fetchData);
    toast.success('ログインしました');
    router.push('/home');
    yield;
  } else {
    toast.error('ログイン中にエラーが発生しました');
    yield;
  }
}

function* watchSignInRequest() {
  yield takeEvery(actions.Types.SIGN_IN_REQUEST, signIn);
}

/*-------------------------------------------------------------------------------------------------
  SignUp
-------------------------------------------------------------------------------------------------*/

async function postSignUp(action: ReturnType<typeof actions.signUpRequest>) {
  const password = hashPassword(action.payload.password);

  try {
    return await axios.post<{ id: number }>('/characters', {
      ...action.payload,
      password,
    });
  } catch {
    return null;
  }
}

function* signUp(action: ReturnType<typeof actions.signUpRequest>) {
  const resultCall = call(postSignUp, action);
  const result: EffectRT<typeof resultCall> = yield resultCall;

  if (result) {
    yield call(postSignIn, {
      type: 'character/sign_in_request',
      payload: {
        key: action.payload.username,
        password: action.payload.password,
      },
    });
    yield call(fetchData);
    toast.success(`${characterIdText(result.data.id)}として登録しました`);
    router.push('/home');
    yield;
  } else {
    toast.error('登録中にエラーが発生しました');
    yield;
  }
}

function* watchSignUpRequest() {
  yield takeEvery(actions.Types.SIGN_UP_REQUEST, signUp);
}

/*-------------------------------------------------------------------------------------------------
  SignOut
-------------------------------------------------------------------------------------------------*/

async function postSignOut(csrfToken: string) {
  try {
    await axios.post('/signout', null, {
      headers: { 'X-Auth-key': csrfToken },
    });
  } catch {
    return false;
  }

  return true;
}

function* signOut() {
  const csrfToken: string | null = yield select(selectCsrfToken);
  if (csrfToken == null) {
    yield;
  } else {
    const resultCall = call(postSignOut, csrfToken);
    const result: EffectRT<typeof resultCall> = yield resultCall;

    if (result) {
      yield put(actions.signOutSuccess());
      toast.success('ログアウトしました');
      router.push('/');
      yield;
    } else {
      toast.error('ログアウト中にエラーが発生しました');
      yield;
    }
  }
}

function* watchSignOutRequest() {
  yield takeEvery(actions.Types.SIGN_OUT_REQUEST, signOut);
}

/*-------------------------------------------------------------------------------------------------
  Notify
-------------------------------------------------------------------------------------------------*/

function* notify(action: ReturnType<typeof actions.notify>) {
  toast.success(action.payload.message);
  yield;
}

function* watchNotify() {
  yield takeEvery(actions.Types.NOTIFY, notify);
}

/*-------------------------------------------------------------------------------------------------
  export
-------------------------------------------------------------------------------------------------*/

const characterSagas = [
  fork(watchSignInRequest),
  fork(watchSignUpRequest),
  fork(watchSignOutRequest),
  fork(watchFetchDataRequest),
  fork(watchNotify),
];

export default characterSagas;
