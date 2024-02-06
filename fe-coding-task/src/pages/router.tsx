import React, {FC, useEffect} from 'react'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {Links} from "../types/routes";
import Home from "./Home";
import Statistics from "./Statistics";
import {useDispatch} from "react-redux";
import {StatisticsActions} from "../redux/reducers/statistics";

const router = createBrowserRouter([
	{
		path: Links.Home,
		element: <Home />,
	},
	{
		path: Links.Statistics,
		element: <Statistics />
	}
]);
export const Router: FC = () => {
	const dispatch = useDispatch()

	useEffect(() => {
		dispatch(StatisticsActions.requestOptions())
	}, [])

	return <RouterProvider router={router} />
}