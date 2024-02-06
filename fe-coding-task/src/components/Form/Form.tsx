import { useForm } from "react-hook-form";
import React, {FC} from "react";
import SelectInput from "../SelectInput/SelectInput";
import {VariableInstance, Option, StateType} from "../../types";
import Button from "@mui/material/Button";
import {useNavigate} from "react-router-dom";
import {Links} from "../../types/routes";
import {useDispatch, useSelector} from 'react-redux';
import {StatisticsSelectors} from "../../redux/reducers/statistics";
import qs from "qs";

const Form: FC = () => {

	const fields = useSelector(StatisticsSelectors.getOptions)?.variables

	const navigate = useNavigate();
	const dispatch = useDispatch();
	const statisticsValue = useSelector(StatisticsSelectors.getStatisticsValues);

	const { handleSubmit, control } = useForm<StateType>({
		defaultValues: {},
		mode: "onChange",
	})

	const arrayOfObjects = (field: VariableInstance): Option[] => field.values.map((value, index) => {
		return { value: value, label: field.valueTexts[index] };
	});

	const onSubmit = async (data: StateType) => {
		navigate(`${Links.Statistics}?${qs.stringify(data, { arrayFormat: 'repeat' })}`)
	}

	return (
		<>
			<form style={{marginBottom: '40px', width: "70%"}} onSubmit={handleSubmit(onSubmit)}>
				{fields && fields.map((field, index) => {
					const optionsOfField = arrayOfObjects(field)

					return <SelectInput fieldName={field.text} control={control} key={field.code} name={field.code} rules={{ required: true }} optionsOfField={optionsOfField} />
				})}
				<Button style={{marginTop: '20px'}} variant="contained" color="primary" type="submit">Find Statistics</Button>
			</form>
		</>
	)
}

export default Form