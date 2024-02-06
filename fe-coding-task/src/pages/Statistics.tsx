import {FC, useEffect, useMemo, useState} from "react";
import {useLocation} from "react-router-dom";
import CloseIcon from '@mui/icons-material/Close';
import {useDispatch, useSelector} from "react-redux";
import {StatisticsActions, StatisticsSelectors} from "../redux/reducers/statistics";
import qs from "qs";
import {Dictionary, StateType} from "../types";
import React from "react";
import { BarChart } from '@mui/x-charts/BarChart';
import {
	cheerfulFiestaPalette,
} from '@mui/x-charts/colorPalettes';
import Button from "@mui/material/Button";
import {Alert, Collapse, IconButton, TextField} from "@mui/material";
import _ from "lodash";

type MappedOptions = Dictionary<{
	text: string,
	value: string
}[]>

const makeSearchGreatAgain = (query: string) => {
	const parsed = qs.parse(query.substring(1), { parseArrays: true })
	const sorted = _.sortBy(Object.keys(parsed)).reduce((prev, current) => {
		return {
			...prev,
			[current]: parsed[current]
		}
	}, {})
	return qs.stringify(sorted, { arrayFormat: 'repeat' });
}

const Statistics: FC = () => {
	const dispatch = useDispatch()
	const location = useLocation()
	const selectedOptions = useSelector(StatisticsSelectors.getSelectedOptions)
	const options = useSelector(StatisticsSelectors.getOptions)
	const statistics = useSelector(StatisticsSelectors.getStatisticsValues)
	const savedStatistics = useSelector(StatisticsSelectors.getSavedStatistics)
	const [comment, setComment] = useState(savedStatistics[makeSearchGreatAgain(location.search)]?.comment || '');
	const [open, setOpen] = React.useState(false);

	useEffect(() => {
		if (!selectedOptions) {
			const parsed = qs.parse(location.search.substring(1), { parseArrays: true })
			let result: StateType = {}
			for (let key of Object.keys(parsed)) {
				if (Array.isArray(parsed[key])) {
					result[key] = parsed[key] as string[]
				} else {
					result[key] = [(parsed[key] || '').toString()]
				}
			}

			dispatch(StatisticsActions.setSelectedOptions(result));
		}
	}, [])

	useEffect(() => {
		if (!!selectedOptions && (statistics?.length || 0) === 0) {
			const savedStatistic = savedStatistics[makeSearchGreatAgain(location.search)]
			if (savedStatistic !== undefined) {
				dispatch(StatisticsActions.setStatisticsValues(savedStatistic.statisticsValues))
			} else {
				dispatch(StatisticsActions.requestStatisticsValues(selectedOptions));
			}
		}
	}, [selectedOptions])

	const mappedOptions = useMemo<MappedOptions>(() => {
		let result: MappedOptions = {}

		if (selectedOptions) {
			for (let key of Object.keys(selectedOptions)) {
				result[key] = []

				const variable = (options?.variables || []).find(x => x.code === key)

				if (variable) {
					for (let value of selectedOptions[key]) {
						let index = variable.values.findIndex(x => x === value)
						if (index !== -1) {
							result[key].push({
								value,
								text: variable.valueTexts[index],
							})
						}
					}
				}
			}
		}

		return result
	}, [selectedOptions, options]);

	const statisticsData = useMemo<any[]>(() => {
		const size = mappedOptions?.ContentsCode?.length || 0;
		const resultArray: any[] = [];

		const tidLength = mappedOptions?.Tid?.length || 0

		for (let i = 0; i < size; ++i) {
			const dataSlice = statistics.slice(i * tidLength, (i + 1) * tidLength);
			for (let j = 0; j < tidLength; ++j) {
				if (resultArray[j]) {
					resultArray[j].data.push(dataSlice[j])
				} else {
					resultArray.push({
						label: mappedOptions?.Tid[j]?.text || '',
						data: [dataSlice[j]],
					})
				}
			}
		}

		return resultArray;
	}, [statistics, mappedOptions])

	const handleSave = () => {
		dispatch(StatisticsActions.setSavedStatistics({ key: makeSearchGreatAgain(location.search) , value: {
				comment: comment,
				statisticsValues: statistics
			} }));
		setOpen(true);
	}

	return (
		<div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
			<h2>{!!mappedOptions?.Boligtype ? mappedOptions?.Boligtype[0]?.text : ''} statistics</h2>
			<BarChart series={statisticsData}
				colors={cheerfulFiestaPalette}
				height={290}
				xAxis={[{ scaleType: 'band', data: mappedOptions?.ContentsCode?.map(tid => tid.text)}]}
				margin={{ top: 50, bottom: 30, left: 70, right: 10 }}
				tooltip={{ trigger: 'item' }}
			></BarChart>
			<span>Enter your comment:</span>
			<TextField value={comment} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
				setComment(event.target.value);
				setOpen(false);
			}} style={{marginBottom: "20px", marginTop: "10px"}}></TextField>
			<Collapse in={open}>
				<Alert
					action={
						<IconButton
							aria-label="close"
							color="inherit"
							size="small"
							onClick={() => {
								setOpen(false);
							}}
						>
							<CloseIcon fontSize="inherit" />
						</IconButton>
					}
					sx={{ mb: 2 }}
				>
					Your comment on this statistics is saved!
				</Alert>
			</Collapse>
			<Button variant="contained" color="secondary" onClick={handleSave}>
				Save
			</Button>
		</div>
	)
}

export default Statistics
