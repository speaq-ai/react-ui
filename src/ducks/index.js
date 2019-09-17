import keplerGlReducer from "kepler.gl/reducers";
import { createStore, combineReducers, applyMiddleware } from "redux";
import { taskMiddleware } from "react-palm/tasks";
import promiseMiddleware from "redux-promise";

import userReducer, { initialState as userState } from "./user-duck";

const reducer = combineReducers({
	// <-- mount kepler.gl reducer in your app
	keplerGl: keplerGlReducer,
	user: userReducer,
	// Your other reducers here
	// app: appReducer
});

// create store
export default createStore(
	reducer,
	{},
	applyMiddleware(taskMiddleware, promiseMiddleware)
);
