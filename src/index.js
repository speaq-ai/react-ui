import React, { Component } from "react";
import ReactDOM from "react-dom";
import VisualizerContainer from "@/containers/visualizer";
import { Provider } from "react-redux";
import store from "@/ducks";

class Root extends Component {
	render() {
		return (
			<Provider store={store}>
				<VisualizerContainer />
			</Provider>
		);
	}
}

ReactDOM.render(<Root />, document.getElementById("root"));
