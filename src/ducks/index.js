import keplerGlReducer from "kepler.gl/reducers";
import { createStore, combineReducers, applyMiddleware } from "redux";
import { taskMiddleware } from "react-palm/tasks";

const reducer = combineReducers({
	// <-- mount kepler.gl reducer in your app
	keplerGl: keplerGlReducer,

	// Your other reducers here
	// app: appReducer
});

// create store
export default createStore(reducer, {}, applyMiddleware(taskMiddleware));
