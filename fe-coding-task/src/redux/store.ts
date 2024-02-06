
import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import { rootReducer } from './rootReducer'

import rootSaga from './sagas'

const sagaMiddleware = createSagaMiddleware()

const store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
			thunk: false,
		}).concat(sagaMiddleware),
})

sagaMiddleware.run(rootSaga)

export default store
