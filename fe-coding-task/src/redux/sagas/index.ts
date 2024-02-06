import { all, AllEffect } from 'redux-saga/effects'
import statisticsSaga from './statistics'
import {SagaGenerator} from "../../types";

export default function* root(): Generator<
	AllEffect<SagaGenerator<unknown>>,
	void
> {
	yield all([statisticsSaga()])
}
