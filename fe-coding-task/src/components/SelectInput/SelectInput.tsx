import { useController, UseControllerProps } from "react-hook-form";
import Select from "react-select";
import { Option, StateType } from "../../types";
import {FC, useEffect} from "react";

interface SelectInputProps extends UseControllerProps<StateType> {
	optionsOfField: Option[]
	fieldName: string
}

const SelectInput: FC<SelectInputProps> = ({ optionsOfField, fieldName, ...props}) => {

	const { field, fieldState } = useController(props)

	const isMulti = fieldName !== 'boligtype'

	useEffect(() => {
		if (!!field.value) {
			sessionStorage.setItem(field.name, JSON.stringify(field.value))
		}
	}, [field.value]);

	useEffect(() => {
		const storedValue = sessionStorage.getItem(field.name);
		if (!!storedValue) {
			const parsedValue = JSON.parse(storedValue);
			field.onChange(parsedValue);
		}
	}, []);


	return (
		<div style={{marginBottom: '10px'}}>
			<Select
				{...field}
				key={field.name}
				isMulti={isMulti}
				placeholder={`Select ${fieldName}...`}
				value={optionsOfField.filter((x) => (field.value || []).includes(x.value))}
				options={optionsOfField}
				onChange={newValue => {
					if (Array.isArray(newValue) && isMulti) {
						field.onChange(newValue.map(x => x.value))
					} else if (!isMulti && newValue && !Array.isArray(newValue)) {
						field.onChange([(newValue as Option).value])
						sessionStorage.setItem(field.name, JSON.stringify(newValue))
					}
				}}
			/>
		</div>
	)
}

export default SelectInput