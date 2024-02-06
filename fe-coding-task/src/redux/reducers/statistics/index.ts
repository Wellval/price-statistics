import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
	StatisticsState,
	FetchTableResponse,
	StateType,
	SavedStatisticsInstance
} from "../../../types";

function getSavedStatistics() {
	const value = localStorage.getItem("savedStatistics")
	return value !== null ? JSON.parse(value) : {}
}

export const initialState: StatisticsState = {
	options: undefined,
	statisticsValues: [],
	selectedOptions: undefined,
	savedStatistics: getSavedStatistics()
}

export const statisticsSlice = createSlice({
	name: 'statistics',
	initialState,
	reducers: {
		requestOptions: (state, action: PayloadAction) => {},
		setOptions: (state, action: PayloadAction<FetchTableResponse>) => {
			state.options = action.payload;
		},
		requestStatisticsValues: (state, action: PayloadAction<StateType>) => {},
		setStatisticsValues: (state, action: PayloadAction<number[]>) => {
			state.statisticsValues = action.payload;
		},
		setSelectedOptions: (state, action: PayloadAction<StateType>) => {
			state.selectedOptions = action.payload;
		},
		setSavedStatistics: (state, action: PayloadAction<{ key: string, value: SavedStatisticsInstance }>) => {
			state.savedStatistics[action.payload.key] = action.payload.value
			localStorage.setItem("savedStatistics", JSON.stringify(state.savedStatistics))
		}
	}
});

export const StatisticsActions = statisticsSlice.actions

const { reducer } = statisticsSlice;

export const StatisticsSelectors = {
	getOptions: (state: { statisticsReducer: StatisticsState }) => state.statisticsReducer.options,
	getStatisticsValues:  (state: { statisticsReducer: StatisticsState }) => state.statisticsReducer.statisticsValues,
	getSelectedOptions:  (state: { statisticsReducer: StatisticsState }) => state.statisticsReducer.selectedOptions,
	getSavedStatistics: (state: { statisticsReducer: StatisticsState }) => state.statisticsReducer.savedStatistics,
}
export default reducer;