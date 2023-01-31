import { createStore, applyMiddleware, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { all, put } from 'redux-saga/effects';

import characterReducer from './reducers/character';
import draftReducer from './reducers/draft';
import characterSagas from './sagas/character';
import draftSagas from './sagas/draft';

const rootReducer = combineReducers({
  character: characterReducer,
  draft: draftReducer,
});
export type RootState = ReturnType<typeof rootReducer>;

const sagaMiddleware = createSagaMiddleware();
const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

function* rootSaga() {
  yield all([...characterSagas, ...draftSagas]);
}

sagaMiddleware.run(rootSaga);

export default store;
