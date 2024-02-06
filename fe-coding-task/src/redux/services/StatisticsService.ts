import axios from "axios";
import {Query, StateType} from "../../types";

const findByInput = (data: StateType) => {
	const queryArray: Query[] = [];
	Object.keys(data).map(key => {
		queryArray.push({"code": key, selection: { "filter": "item", "values": data[key] }})
	})
	return axios.post("https://data.ssb.no/api/v0/no/table/07241", {
		"query": queryArray,
		"response": {
			"format": "json-stat2"
		}
	}, { headers: { "Content-Type": "application/json" }});
};

const findAllOptions = () => {
	return axios.get("https://data.ssb.no/api/v0/no/table/07241");
};

const StatisticsService = {
	findByInput,
	findAllOptions
};

export default StatisticsService;