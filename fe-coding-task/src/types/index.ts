import {StrictEffect} from "redux-saga/effects";

export type SagaGenerator<ResponseData> = Generator<
	StrictEffect,
	void,
	ResponseData
>

export interface VariableInstance {
	code: string
	text: string
	valueTexts: string[]
	values: string[]
	elimination?: boolean
}

export interface FetchTableResponse {
	title: string
	variables: VariableInstance[]
}

export interface Option {
	value: string
	label: string
}

export interface Dictionary<T> {
	[key: string]: T
}

export interface Query {
	code: string
	selection: Selection
}

interface Selection {
	filter: string
	values: string[]
}

export interface FetchData {
	query: Query[]
	response: Response
}

interface Response {
	format: string
}

export type StateType = Dictionary<string[]>

export type SavedStatisticsInstance = {
	comment?: string
	statisticsValues: number[]
}

export type SavedStatistics = Dictionary<SavedStatisticsInstance>

export type StatisticsState = {
	options?: FetchTableResponse
	statisticsValues: number[]
	selectedOptions?: StateType
	savedStatistics: SavedStatistics
}
