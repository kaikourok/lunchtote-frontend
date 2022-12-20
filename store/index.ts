import { createStore, applyMiddleware, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { all, put } from 'redux-saga/effects';

import characterReducer from './reducers/character';
import characterSagas from './sagas/character';

const rootReducer = combineReducers({
  character: characterReducer,
});
export type RootState = ReturnType<typeof rootReducer>;

const sagaMiddleware = createSagaMiddleware();
const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

function* rootSaga() {
  yield all([...characterSagas]);
}

sagaMiddleware.run(rootSaga);

export default store;
