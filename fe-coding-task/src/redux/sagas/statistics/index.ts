import { all, put, StrictEffect, takeLeading, call } from 'redux-saga/effects'
import StatisticsService from "../../services/StatisticsService";
import {StatisticsActions} from "../../reducers/statistics";
import {FetchTableResponse, SagaGenerator, StateType} from "../../../types";
import {AxiosResponse} from "axios";
import {PayloadAction} from "@reduxjs/toolkit";

export function* getOptions() {
	const response: AxiosResponse<FetchTableResponse> = yield call(StatisticsService.findAllOptions)
	yield put(
		StatisticsActions.setOptions(response.data)
	)
}

export function* getStatisticsValues(action: PayloadAction<StateType>) {
	const data = action.payload
	yield put(
		StatisticsActions.setSelectedOptions(data)
	)
	const response: AxiosResponse<{ value: number[] }> = yield call(StatisticsService.findByInput, data)
	yield put(
		StatisticsActions.setStatisticsValues(response.data.value)
	)
}

export default function* groupsSagas(): SagaGenerator<StrictEffect> {
	yield all([
		yield takeLeading(StatisticsActions.requestOptions, getOptions),
		yield takeLeading(StatisticsActions.requestStatisticsValues, getStatisticsValues),
	])
}
