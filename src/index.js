import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "@/ducks";
import App from "@/containers/app";

class Root extends Component {
	render() {
		return (
			<Provider store={store}>
				<App />
			</Provider>
		);
	}
}

ReactDOM.render(<Root />, document.getElementById("root"));
