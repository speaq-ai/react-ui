import keplerGlReducer from "kepler.gl/reducers";
import { createStore, combineReducers, applyMiddleware } from "redux";
import { taskMiddleware } from "react-palm/tasks";
import promiseMiddleware from "redux-promise";

import userReducer, { initialState as userState } from "./user-duck";
import logger from "redux-logger";

const customizedKGlReducer = keplerGlReducer.initialState({
  uiState: {
    readOnly: false, // Set this to true to disable layer configuration box
    currentModal: null,
  },
});

const reducer = combineReducers({
  // <-- mount kepler.gl reducer in your app
  keplerGl: customizedKGlReducer,
  user: userReducer,
  // Your other reducers here
  // app: appReducer
});

// create store
export default createStore(
  reducer,
  {},
  // add logger for redux logging
  // applyMiddleware(logger, taskMiddleware, promiseMiddleware)
  applyMiddleware(taskMiddleware, promiseMiddleware)
);
