import {combineReducers} from "@reduxjs/toolkit";
import statisticsReducer from './reducers/statistics'

export const rootReducer = combineReducers({
	statisticsReducer
})